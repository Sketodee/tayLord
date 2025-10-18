import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import dbConnect from '@/app/lib/mongodb';
import Measurement from '@/app/models/Measurement';
import Client from '@/app/models/Client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    console.log(clientId, session.user.id)

    // Verify client belongs to designer
    const client = await Client.findOne({
      _id: clientId,
      designerId: session.user.id,
    });

    console.log(client)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const measurements = await Measurement.find({ clientId }).sort({ createdAt: -1 });
    console.log(measurements)

    return NextResponse.json({ measurements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { clientId, clothingType, measurements, unit, notes } = body;

    if (!clientId || !clothingType || !measurements) {
      return NextResponse.json(
        { error: 'Client ID, clothing type, and measurements are required' },
        { status: 400 }
      );
    }

    // Verify client belongs to designer
    const client = await Client.findOne({
      _id: clientId,
      designerId: session.user.id,
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const measurement = await Measurement.create({
      clientId,
      clothingType,
      measurements: new Map(Object.entries(measurements)),
      unit: unit || 'inches',
      notes,
    });

    return NextResponse.json({ measurement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}