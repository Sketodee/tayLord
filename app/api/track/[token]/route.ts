import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Order from '@/app/models/Order';
import BusinessProfile from '@/app/models/BusinessProfile';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();
    const { token } = await params;

    const order = await Order.findOne({ trackingToken: token })
      .populate('clientId', 'name')
      .select('-designerId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get business profile for branding
    const businessProfile = await BusinessProfile.findOne({ userId: order.designerId });

    return NextResponse.json({ 
      order: {
        orderId: order.orderId,
        title: order.title,
        description: order.description,
        status: order.status,
        priority: order.priority,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        completedDate: order.completedDate,
        statusHistory: order.statusHistory,
        items: order.items,
        clientName: order.clientId?.name,
      },
      business: businessProfile ? {
        businessName: businessProfile.businessName,
        logoUrl: businessProfile.logoUrl,
        phone: businessProfile.phone,
        email: businessProfile.email,
        primaryColor: businessProfile.primaryColor,
      } : null
    });
  } catch (error: any) {
    console.error('Error fetching tracking info:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}