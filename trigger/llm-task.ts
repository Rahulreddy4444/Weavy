import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export const runLLM = task({
  id: "run-llm",
  run: async (payload: {
    model: string;
    systemPrompt?: string;
    userMessage?: string;
    images?: string[];
  }) => {
    console.log("Starting LLM execution", { model: payload.model });

    try {
      const geminiModel = genAI.getGenerativeModel({ 
        model: payload.model || "gemini-pro" 
      });

      const parts: any[] = [];

      // Add system prompt if provided
      if (payload.systemPrompt) {
        parts.push({ text: `System: ${payload.systemPrompt}\n\n` });
      }

      // Add user message
      if (payload.userMessage) {
        parts.push({ text: payload.userMessage });
      }

      // Add images if provided (for vision models)
      if (payload.images && Array.isArray(payload.images) && payload.images.length > 0) {
        for (const imageUrl of payload.images) {
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          
          const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
          
          parts.push({
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          });
        }
      }

      console.log("Generating content with Gemini");

      const result = await geminiModel.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      console.log("LLM execution completed", { 
        responseLength: text.length 
      });

      return {
        success: true,
        response: text,
        model: payload.model,
      };
    } catch (error: any) {
      console.error("LLM execution failed", { error: error.message });
      throw error;
    }
  },
});