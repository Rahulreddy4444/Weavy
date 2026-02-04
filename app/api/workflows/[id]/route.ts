// import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server';
// import { prisma } from '@/lib/prisma';
// import { z } from 'zod';

// const updateSchema = z.object({
//   name: z.string().min(1).optional(),
//   description: z.string().optional(),
//   nodes: z.array(z.any()).optional(),
//   edges: z.array(z.any()).optional(),
//   viewport: z.any().optional(),
// });

// // GET /api/workflows/[id] - Get single workflow
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = await auth();
    
//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const workflow = await prisma.workflow.findFirst({
//       where: {
//         id: params.id,
//         userId,
//       },
//       include: {
//         workflowRuns: {
//           orderBy: { startedAt: 'desc' },
//           take: 10,
//         },
//       },
//     });

//     if (!workflow) {
//       return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
//     }

//     return NextResponse.json({ workflow });
//   } catch (error) {
//     console.error('Error fetching workflow:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch workflow' },
//       { status: 500 }
//     );
//   }
// }

// // PATCH /api/workflows/[id] - Update workflow
// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = await auth();
    
//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const validated = updateSchema.parse(body);

//     const workflow = await prisma.workflow.updateMany({
//       where: {
//         id: params.id,
//         userId,
//       },
//       data: validated,
//     });

//     if (workflow.count === 0) {
//       return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: 'Invalid request data', details: error.issues },
//         { status: 400 }
//       );
//     }
    
//     console.error('Error updating workflow:', error);
//     return NextResponse.json(
//       { error: 'Failed to update workflow' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE /api/workflows/[id] - Delete workflow
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = await auth();
    
//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const result = await prisma.workflow.deleteMany({
//       where: {
//         id: params.id,
//         userId,
//       },
//     });

//     if (result.count === 0) {
//       return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting workflow:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete workflow' },
//       { status: 500 }
//     );
//   }
// }








import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  viewport: z.any().optional(),
});

// GET /api/workflows/[id] - Get single workflow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Await params

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        workflowRuns: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

// PATCH /api/workflows/[id] - Update workflow
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Await params

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const workflow = await prisma.workflow.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: validated,
    });

    if (workflow.count === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// DELETE /api/workflows/[id] - Delete workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Await params

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await prisma.workflow.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}