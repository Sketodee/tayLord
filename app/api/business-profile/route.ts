import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import dbConnect from '@/app/lib/mongodb';
import BusinessProfile from '@/app/models/BusinessProfile';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let profile = await BusinessProfile.findOne({ userId: session.user.id });

    // Create default profile if doesn't exist
    if (!profile) {
      profile = await BusinessProfile.create({
        userId: session.user.id,
        businessName: session.user.name || 'My Business',
        email: session.user.email,
      });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error fetching business profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const {
      businessName,
      tagline,
      address,
      phone,
      email,
      website,
      socialMedia,
      logoUrl,
      primaryColor,
      secondaryColor,
    } = body;

    let profile = await BusinessProfile.findOne({ userId: session.user.id });

    if (!profile) {
      // Create new profile
      profile = await BusinessProfile.create({
        userId: session.user.id,
        businessName,
        tagline,
        address,
        phone,
        email,
        website,
        socialMedia,
        logoUrl,
        primaryColor,
        secondaryColor,
      });
    } else {
      // Update existing profile
      if (businessName) profile.businessName = businessName;
      if (tagline !== undefined) profile.tagline = tagline;
      if (address !== undefined) profile.address = address;
      if (phone !== undefined) profile.phone = phone;
      if (email !== undefined) profile.email = email;
      if (website !== undefined) profile.website = website;
      if (socialMedia) profile.socialMedia = socialMedia;
      if (logoUrl !== undefined) profile.logoUrl = logoUrl;
      if (primaryColor) profile.primaryColor = primaryColor;
      if (secondaryColor) profile.secondaryColor = secondaryColor;
      profile.updatedAt = new Date();
      
      await profile.save();
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error updating business profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}