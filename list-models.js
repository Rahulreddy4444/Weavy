const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    try {
        // Note: older versions of the SDK might not have listModels exposed directly 
        // on the main class or might behave differently. 
        // We'll try to use the model manager if available or just hit the REST endpoint if SDK fails.

        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error("No API Key found in .env.local");
            return;
        }

        console.log("Fetching models via REST API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("\nAvailable Models:");
        data.models.forEach(model => {
            if (model.name.includes("veo") || model.name.includes("video")) {
                console.log(`[VIDEO] ${model.name} - ${model.version}`);
            } else {
                console.log(`${model.name}`);
            }
        });

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
