import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import Client from '@/app/models/Client';
import dbConnect from '@/app/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search');
    const gender = searchParams.get('gender');

    let query: any = { designerId: session.user.id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // ✅ FIXED — pass authOptions here too
    const session = await getServerSession(authOptions);
    console.log(session);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { name, email, phone, gender, notes } = body;

    if (!name || !gender) {
      return NextResponse.json(
        { error: 'Name and gender are required' },
        { status: 400 }
      );
    }

    const client = await Client.create({
      designerId: session.user.id, // ✅ will now be defined
      name,
      email,
      phone,
      gender,
      notes,
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
