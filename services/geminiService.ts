import { GoogleGenAI } from "@google/genai";
import { ImageFile } from "../types";

// According to guidelines, API key must be from process.env.API_KEY
// Assuming process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper to convert File to a GoogleGenerativeAI.Part object.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result includes the data URL prefix (e.g., "data:image/png;base64,"), remove it.
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const generatePromptForImage = async (imageFile: ImageFile, overallPrompt: string, language: string): Promise<string> => {
    // For describing an image, a multimodal model is needed. 'gemini-2.5-flash' is a suitable choice.
    const model = 'gemini-2.5-flash';

    const imagePart = await fileToGenerativePart(imageFile.file);

    let prompt = `You are an expert at writing prompts for video generation models like Veo. Your task is to describe the provided image to create a video prompt. Be descriptive, artistic, and concise. Your output should be a single paragraph. The final prompt must be in ${language}.`;

    if (imageFile.description) {
        prompt += `\n\nThe user has provided the following description to guide you, use it as context: "${imageFile.description}"`;
    }
    if (overallPrompt) {
        prompt += `\n\nAdditionally, adhere to these overall style instructions for the final prompt: "${overallPrompt}"`;
    }

    const textPart = { text: prompt };
    
    // As per guidelines, call generateContent with model and contents.
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [imagePart, textPart] }],
    });
    
    // As per guidelines, access text directly from the response.
    const generatedText = response.text;
    if (!generatedText) {
      throw new Error("The API did not return any text. The response might have been blocked.");
    }

    return generatedText.trim();
};
