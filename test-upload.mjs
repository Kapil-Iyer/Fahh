import fs from 'fs';

async function testUpload() {
  try {
    console.log('1. Fetching random image from Unsplash...');
    // Download a sample image
    const imageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=500&fit=crop';
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Convert the image array buffer to a Base64 encoded data URI
    const buffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const base64String = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${contentType};base64,${base64String}`;
    
    console.log('2. Image fetched. Base64 length:', dataUri.length);

    console.log('3. Sending POST request to local upload route...');
    // Send POST request to the local API
    const apiResponse = await fetch('http://10.200.13.35:3001/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: dataUri,
        activity: 'Coffee',
        location: 'SLC',
        date: 'Oct 24, 2024',
        memberCount: 5,
        filterStyle: 'sepia'
      })
    });

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('❌ Upload failed:', result);
      return;
    }

    console.log('✅ Upload successful!');
    console.log('📸 Cloudinary Polaroid URL:', result.cloudinary_url);
    console.log('\nClick the URL above to view the transformed image!');

  } catch (error) {
    console.error('Error in test script:', error);
  }
}

testUpload();
