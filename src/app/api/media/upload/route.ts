import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, activity, location, date, memberCount, filterStyle } = body;

    // Validate request body
    if (!image || !activity || !location || !date || memberCount === undefined || !filterStyle) {
      return NextResponse.json(
        { error: 'Missing required fields: image, activity, location, date, memberCount, filterStyle' },
        { status: 400 }
      );
    }

    // Determine the base effect
    const baseTransform: Record<string, unknown> = { width: 500, height: 500, crop: 'fill' };
    if (filterStyle === 'grayscale') {
      baseTransform.effect = 'grayscale';
    } else if (filterStyle === 'sepia') {
      baseTransform.effect = 'sepia';
    }

    // Upload to Cloudinary with on-the-fly transformations for 'Photo Booth Polaroid' effect
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'meetups/polaroids',
      transformation: [
        // 1. Base transform (crop + optional filter)
        baseTransform,
        
        // 2. Add a 20px solid white border
        { border: '20px_solid_white' },
        
        // 3. Pad the bottom with white space to a total height of 750px
        // Since image was 500x500, adding a 20px border makes it 540x540.
        // We set height to 750, crop to pad, and gravity to north so padding goes to the bottom.
        { width: 540, height: 750, crop: 'pad', background: 'white', gravity: 'north' },
        
        // 4. Overlay the 4 lines of text in the bottom padded area perfectly centered
        // We stack them using gravity: 'north' with an offset (y)
        {
          overlay: { font_family: 'Montserrat', font_size: 38, font_weight: 'bold', text: `${activity} %40 ${location}` },
          color: 'black',
          gravity: 'north',
          y: 560
        },
        {
          overlay: { font_family: 'Roboto', font_size: 20, font_weight: 'normal', text: date },
          color: 'darkgray',
          gravity: 'north',
          y: 615
        },
        {
          overlay: { font_family: 'Montserrat', font_size: 22, font_weight: 'bold', text: `${memberCount} wanderers joined here` },
          color: 'black',
          gravity: 'north',
          y: 655
        },
        {
          // Cloudinary requires URL-encoding for # (%23)
          overlay: { font_family: 'Caveat', font_size: 28, text: '%23wandermoment' },
          color: '#FF5722',
          gravity: 'north',
          y: 695
        }
      ]
    });

    const cloudinary_url = uploadResponse.secure_url;

    return NextResponse.json({ success: true, cloudinary_url });
  } catch (error: unknown) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error occurred during file upload' },
      { status: 500 }
    );
  }
}
