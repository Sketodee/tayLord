import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/app/lib/mongodb';
import Client from '@/app/models/Client';
import { authOptions } from '@/app/lib/auth';
import Measurement from '@/app/models/Measurement';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    console.log('GET /api/clients/[id] - Session:', session);
    console.log('GET /api/clients/[id] - Client ID:', id);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const client = await Client.findById(id);

    console.log('GET /api/clients/[id] - Found client:', client);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client belongs to the logged-in designer
    if (client.designerId.toString() !== session.user.id) {
      console.log('Designer mismatch!');
      console.log('Client designerId:', client.designerId.toString());
      console.log('Session user.id:', session.user.id);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error('Error in GET /api/clients/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { name, email, phone, gender, notes } = body;

    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client belongs to the logged-in designer
    if (client.designerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the client
    client.name = name;
    client.email = email;
    client.phone = phone;
    client.gender = gender;
    client.notes = notes;
    client.updatedAt = new Date();
    await client.save();

    return NextResponse.json({ client });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if client belongs to the logged-in designer
    if (client.designerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the client
    await Client.findByIdAndDelete(id);

    // Delete all measurements for this client
    await Measurement.deleteMany({ clientId: id });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import dbConnect from '@/app/lib/mongodb';
// import Client from '@/app/models/Client';
// import { authOptions } from '@/app/lib/auth';
// import Measurement from '@/app/models/Measurement';


// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     console.log('GET /api/clients/[id] - Session:', session);
//     console.log('GET /api/clients/[id] - Client ID:', params.id);
    
//     if (!session || !session.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await dbConnect();

//     const client = await Client.findById(params.id);

//     console.log('GET /api/clients/[id] - Found client:', client);

//     if (!client) {
//       return NextResponse.json({ error: 'Client not found' }, { status: 404 });
//     }

//     // Check if client belongs to the logged-in designer
//     if (client.designerId.toString() !== session.user.id) {
//       console.log('Designer mismatch!');
//       console.log('Client designerId:', client.designerId.toString());
//       console.log('Session user.id:', session.user.id);
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     }

//     return NextResponse.json({ client });
//   } catch (error: any) {
//     console.error('Error in GET /api/clients/[id]:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await dbConnect();

//     const body = await req.json();
//     const { name, email, phone, gender, notes } = body;

//     const client = await Client.findById(params.id);

//     if (!client) {
//       return NextResponse.json({ error: 'Client not found' }, { status: 404 });
//     }

//     // Check if client belongs to the logged-in designer
//     if (client.designerId.toString() !== session.user.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     }

//     // Update the client
//     client.name = name;
//     client.email = email;
//     client.phone = phone;
//     client.gender = gender;
//     client.notes = notes;
//     client.updatedAt = new Date();
//     await client.save();

//     return NextResponse.json({ client });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await dbConnect();

//     const client = await Client.findById(params.id);

//     if (!client) {
//       return NextResponse.json({ error: 'Client not found' }, { status: 404 });
//     }

//     // Check if client belongs to the logged-in designer
//     if (client.designerId.toString() !== session.user.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     }

//     // Delete the client
//     await Client.findByIdAndDelete(params.id);

//     // Delete all measurements for this client
//     await Measurement.deleteMany({ clientId: params.id });

//     return NextResponse.json({ message: 'Client deleted successfully' });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }