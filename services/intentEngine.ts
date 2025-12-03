import { GoogleGenAI, Type } from "@google/genai";

// 1. Definition of System Capabilities
export const CAPABILITY_MANIFEST = {
  AUTH_SYSTEM: {
    id: 'AUTH_SYSTEM',
    component: 'AuthLab',
    description: 'Login forms, user linking, password reset, authentication flows.',
    defaultProps: { initialMode: 'login' }
  },
  DB_ADMIN: {
    id: 'DB_ADMIN',
    component: 'FirestoreAdmin',
    description: 'Database management, CRUD operations, inspecting collections like users, logs, products.',
    defaultProps: { initialCollection: 'users' }
  },
  VOICE_AGENT: {
    id: 'VOICE_AGENT',
    component: 'VoiceLab',
    description: 'Voice assistants, text-to-speech, speech-to-text, personality AI bots.',
    defaultProps: { initialPersonality: 'neutral' }
  },
  AUDIO_SYNTH: {
    id: 'AUDIO_SYNTH',
    component: 'SynthLab',
    description: 'Music generation, synthesizers, audio composition, sound effects.',
    defaultProps: { preset: 'retro' }
  },
  DIAGNOSTICS: {
    id: 'DIAGNOSTICS',
    component: 'StatusCard', // Maps to the dashboard view
    description: 'System health check, connection tests, status overview.',
    defaultProps: {}
  }
};

export interface IntentResult {
  intentId: string;
  confidence: number;
  config: Record<string, any>;
  reasoning: string;
}

/**
 * Uses Gemini to translate a natural language prompt into a structured UI Intent.
 */
export const interpretPrompt = async (apiKey: string, userPrompt: string): Promise<IntentResult> => {
  if (!apiKey) throw new Error("API Key required for Intent Engine");

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are the kernel of an OS called "DevNexus". Your job is to map user requests to internal UI Modules.
    
    Available Modules (IDs):
    - AUTH_SYSTEM: For login, sign up, auth, users, accounts.
    - DB_ADMIN: For database, data, records, collections (users, logs, etc), CMS.
    - VOICE_AGENT: For voice, speak, talk, translation, assistant personalities.
    - AUDIO_SYNTH: For music, sound, generation, synth, audio.
    
    Return a JSON object matching this schema:
    {
      "intentId": "ONE_OF_THE_ABOVE_IDS",
      "config": { ...specific props based on context... },
      "reasoning": "Brief explanation of why"
    }

    Specific Config Rules:
    - If DB_ADMIN: extract "initialCollection" if mentioned (e.g., "show users" -> "users").
    - If VOICE_AGENT: extract "initialPersonality" (neutral, sarcastic, yoda, tech).
    - If AUTH_SYSTEM: extract "initialMode" (login, link, reset).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intentId: { type: Type.STRING },
            config: { type: Type.OBJECT, properties: {} }, // Loose schema for flex props
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Fallback if AI hallucinates an ID
    if (!CAPABILITY_MANIFEST[result.intentId as keyof typeof CAPABILITY_MANIFEST]) {
       return {
         intentId: 'DIAGNOSTICS',
         confidence: 0,
         config: {},
         reasoning: "Fallback: Intent not recognized."
       };
    }

    return {
      intentId: result.intentId,
      confidence: 0.9,
      config: result.config || {},
      reasoning: result.reasoning
    };

  } catch (error) {
    console.error("Intent Engine Failure:", error);
    throw error;
  }
};