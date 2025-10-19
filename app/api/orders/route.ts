import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import dbConnect from '@/app/lib/mongodb';
import Order from '@/app/models/Order';
import Client from '@/app/models/Client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const clientId = searchParams.get('clientId');

    let query: any = { designerId: session.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    const orders = await Order.find(query)
      .populate('clientId', 'name email phone gender')
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { clientId, title, description, items, deliveryDate, priority, notes, images } = body;

    if (!clientId || !title || !deliveryDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Client, title, delivery date, and at least one item are required' },
        { status: 400 }
      );
    }

    // Verify client belongs to designer
    const client = await Client.findById(clientId);
    if (!client || client.designerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const order = await Order.create({
      clientId,
      designerId: session.user.id,
      title,
      description,
      items,
      deliveryDate,
      priority: priority || 'medium',
      notes,
      images: images || [],
      statusHistory: [
        {
          status: 'pending',
          date: new Date(),
          notes: 'Order created',
        },
      ],
    });

    const populatedOrder = await Order.findById(order._id).populate('clientId', 'name email phone gender');

    return NextResponse.json({ order: populatedOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}