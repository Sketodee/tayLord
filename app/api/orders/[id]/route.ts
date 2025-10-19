import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import dbConnect from '@/app/lib/mongodb';
import Order from '@/app/models/Order';
import '@/app/models/Client'; // Side-effect import
import '@/app/models/Measurement'; // Side-effect import



export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findById(id)
      .populate('clientId', 'name email phone gender')
      .populate('items.measurementId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.designerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { title, description, items, deliveryDate, priority, status, notes, images, statusNote } = body;

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.designerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update fields
    if (title) order.title = title;
    if (description !== undefined) order.description = description;
    if (items) order.items = items;
    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (priority) order.priority = priority;
    if (notes !== undefined) order.notes = notes;
    if (images) order.images = images;

    // Update status and add to history
    if (status && status !== order.status) {
      order.status = status;
      order.statusHistory.push({
        status,
        date: new Date(),
        notes: statusNote || '',
      });

      if (status === 'completed' && !order.completedDate) {
        order.completedDate = new Date();
      }
    }

    order.updatedAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('clientId', 'name email phone gender')
      .populate('items.measurementId');

    return NextResponse.json({ order: populatedOrder });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.designerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Order.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}