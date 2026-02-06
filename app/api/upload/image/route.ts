// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server';

// export async function POST(request: NextRequest) {
//   try {
//     const { userId } = getAuth(request);
    
//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const formData = await request.formData();
//     const file = formData.get('file') as File;

//     if (!file) {
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     // Validate file type
//     const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
//     if (!validTypes.includes(file.type)) {
//       return NextResponse.json(
//         { error: 'Invalid file type' },
//         { status: 400 }
//       );
//     }

//     // Upload to Transloadit
//     const uploadFormData = new FormData();
//     uploadFormData.append('file', file);

//     const transloaditResponse = await fetch('https://api2.transloadit.com/assemblies', {
//       method: 'POST',
//       body: JSON.stringify({
//         auth: {
//           key: process.env.TRANSLOADIT_KEY!,
//         },
//         steps: {
//           import: {
//             robot: '/upload/handle',
//           },
//           export: {
//             use: 'import',
//             robot: '/s3/store',
//             credentials: 'my_s3_credentials', // Configure in Transloadit
//           },
//         },
//       }),
//     });

//     const result = await transloaditResponse.json();

//     // For simplicity, using a mock URL
//     // In production, you'd wait for Transloadit assembly completion
//     const url = `https://cdn.transloadit.com/files/${Date.now()}_${file.name}`;

//     return NextResponse.json({ url });
//   } catch (error) {
//     console.error('Image upload error:', error);
//     return NextResponse.json(
//       { error: 'Upload failed' },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // For demo purposes, create a mock URL
    // In production, upload to Transloadit/S3
    const url = `https://placehold.co/400x400/png?text=${encodeURIComponent(file.name)}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}