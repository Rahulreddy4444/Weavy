import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Check if sample workflow already exists
    const existing = await prisma.workflow.findFirst({
        where: { name: 'Sample Workflow: Generative Image Pipeline' }
    });

    if (existing) {
        console.log('Sample workflow already exists.');
        return;
    }

    // Get the first user to assign the workflow to
    const user = await prisma.user.findFirst();

    if (!user) {
        console.log('No users found in the database. Please sign in first to create a user, then run seed again.');
        return;
    }

    const nodes = [
        {
            id: 'node-1',
            type: 'textNode',
            position: { x: 100, y: 100 },
            data: { text: 'A futuristic city skyline at night with flying cars and neon lights' }
        },
        {
            id: 'node-2',
            type: 'textToImageNode',
            position: { x: 400, y: 100 },
            data: { prompt: '' }
        },
        {
            id: 'node-3',
            type: 'cropImageNode',
            position: { x: 700, y: 100 },
            data: { xPercent: 10, yPercent: 10, widthPercent: 80, heightPercent: 80 }
        },
        {
            id: 'node-4',
            type: 'outputNode',
            position: { x: 1000, y: 100 },
            data: {}
        }
    ];

    const edges = [
        { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: 'output', targetHandle: 'prompt' },
        { id: 'edge-2', source: 'node-2', target: 'node-3', sourceHandle: 'output', targetHandle: 'image' },
        { id: 'edge-3', source: 'node-3', target: 'node-4', sourceHandle: 'output', targetHandle: 'input' }
    ];

    await prisma.workflow.create({
        data: {
            name: 'Sample Workflow: Generative Image',
            description: 'Generates an image from text and crops it.',
            nodes: JSON.stringify(nodes),
            edges: JSON.stringify(edges),
            userId: user.id
        }
    });

    console.log('Sample workflow created successfully!');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
