// import { NextRequest, NextResponse } from 'next/server';
// import { getAuth } from '@clerk/nextjs/server';
// import { prisma } from '@/lib/prisma';

// // GET /api/runs/[id] - Get run details
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = getAuth(request);
    
//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const run = await prisma.workflowRun.findFirst({
//       where: {
//         id: params.id,
//         userId,
//       },
//       include: {
//         workflow: {
//           select: {
//             id: true,
//             name: true,
//             nodes: true,
//             edges: true,
//           },
//         },
//       },
//     });

//     if (!run) {
//       return NextResponse.json({ error: 'Run not found' }, { status: 404 });
//     }

//     return NextResponse.json({ run });
//   } catch (error) {
//     console.error('Error fetching run:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch run' },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const run = await prisma.workflowRun.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            nodes: true,
            edges: true,
          },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    return NextResponse.json({ run });
  } catch (error) {
    console.error('Error fetching run:', error);
    return NextResponse.json(
      { error: 'Failed to fetch run' },
      { status: 500 }
    );
  }
}