import { GoogleGenAI, Type } from "@google/genai";

export interface GeneratedFile {
  name: string;
  code: string;
  language?: string;
}

export interface GeneratedModule {
  moduleName: string;
  description: string;
  files: GeneratedFile[];
}

/**
 * Uses Gemini to act as a Senior React Architect and generate a complete module.
 */
export const generateModuleCode = async (apiKey: string, prompt: string): Promise<GeneratedModule> => {
  if (!apiKey) throw new Error("Gemini API Key is required.");

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are a Senior React Software Architect and UI Engineer.
    Your goal is to generate complete, production-ready, self-contained React modules based on user requests.
    
    Output Format: JSON (Strictly).
    
    Structure:
    {
      "moduleName": "PascalCaseName",
      "description": "Short description of what this module does.",
      "files": [
        { "name": "index.tsx", "code": "..." },
        { "name": "hooks.ts", "code": "..." },
        { "name": "styles.css", "code": "..." }
      ]
    }

    Rules:
    1. Code must be modern React (Hooks, Functional Components).
    2. Use Tailwind CSS for styling in the 'code' (className).
    3. If 'styles.css' is not needed due to Tailwind, omit it or make it empty.
    4. Ensure imports are relative and correct within the module context.
    5. The 'index.tsx' must export the main component as default.
    6. Include lucid-react icons if needed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a React module for: ${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moduleName: { type: Type.STRING },
            description: { type: Type.STRING },
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  code: { type: Type.STRING }
                },
                required: ["name", "code"]
              }
            }
          },
          required: ["moduleName", "files"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    if (!result.moduleName || !result.files) {
        throw new Error("AI response was incomplete or malformed.");
    }

    return result as GeneratedModule;

  } catch (error: any) {
    console.error("Module Generation Failed:", error);
    throw new Error(`Generation failed: ${error.message}`);
  }
};