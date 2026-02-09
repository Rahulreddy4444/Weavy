import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const workflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
  viewport: z.any().optional(),
});

// GET /api/workflows - List all workflows for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    await ensureUserExists(userId);

    const workflows = await prisma.workflow.findMany({
      where: { 
        user: {
          clerkId: userId
        }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { workflowRuns: true },
        },
      },
    });

    const formattedWorkflows = workflows.map((w) => ({
      ...w,
      nodes: JSON.parse(w.nodes as string),
      edges: JSON.parse(w.edges as string),
    }));

    return NextResponse.json({ workflows: formattedWorkflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

// POST /api/workflows - Create new workflow
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = workflowSchema.parse(body);

    // Ensure user exists in database and get the DB user ID
    const user = await ensureUserExists(clerkUserId);

    const workflow = await prisma.workflow.create({
      data: {
        ...validated,
        nodes: JSON.stringify(validated.nodes ?? []),
        edges: JSON.stringify(validated.edges ?? []),
        userId: user.id, // Use the database user ID, not Clerk ID
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

// Helper function to ensure user exists in database
async function ensureUserExists(clerkUserId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!user) {
    // Create user if doesn't exist
    user = await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email: `user-${clerkUserId}@temp.com`, // Temporary email
      },
    });
  }

  return user;
}