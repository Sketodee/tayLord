import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Check for single file (backward compatibility)
    const singleFile = formData.get('file') as File | null;
    
    // Check for multiple files
    const multipleFiles = formData.getAll('files') as File[];

    // Determine which files to process
    const filesToUpload: File[] = [];
    
    if (singleFile) {
      filesToUpload.push(singleFile);
    }
    
    if (multipleFiles.length > 0) {
      filesToUpload.push(...multipleFiles);
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Upload all files to Cloudinary
    const uploadPromises = filesToUpload.map(async (file) => {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'designer-app',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      return {
        url: (result as any).secure_url,
        publicId: (result as any).public_id,
      };
    });

    const results = await Promise.all(uploadPromises);

    // Return single object for single file, array for multiple files
    if (results.length === 1) {
      return NextResponse.json(results[0]);
    } else {
      return NextResponse.json({ 
        urls: results.map(r => r.url),
        publicIds: results.map(r => r.publicId),
        count: results.length,
      });
    }
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ 
      error: error.message || 'Upload failed',
      details: error.stack 
    }, { status: 500 });
  }
}