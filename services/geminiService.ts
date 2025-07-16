import { GoogleGenAI, GenerateContentResponse, Chat, Content, Part, Type } from "@google/genai";
import { API_KEY } from '../config';
import { GEMINI_MODEL_TEXT } from '../constants';
import { FeedbackItem, GroundingChunk } from "../types";

if (!API_KEY || API_KEY === "YOUR_API_KEY") {
  console.error("API_KEY for Gemini is not set. Please update the API_KEY in config.ts.");
  // alert("Gemini API Key is not configured. The AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });

export const createChatSession = (systemInstruction: string, history?: Content[]): Chat => {
  return ai.chats.create({
    model: GEMINI_MODEL_TEXT,
    config: {
      systemInstruction: systemInstruction,
    },
    history: history || [],
  });
};

export const sendMessageToChat = async (chat: Chat, messageText: string): Promise<{ responseText: string; groundingChunks: GroundingChunk[] | null }> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message: messageText });
    const responseText = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    let groundingChunks: GroundingChunk[] | null = null;
    if (groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
        groundingChunks = groundingMetadata.groundingChunks.map((chunk: GroundingAttribution_GroundingChunk): GroundingChunk => ({
            web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri } : undefined
        }));
    }
    return { responseText, groundingChunks };
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const getFeedbackOnUserMessage = async (userMessage: string, aiResponse: string, scenarioContext: string): Promise<FeedbackItem[]> => {
  const prompt = `
Context: The user is practicing English in a scenario: "${scenarioContext}".
User's message: "${userMessage}"
AI's response to user: "${aiResponse}"

Analyze the user's message for English language proficiency. Provide brief, constructive feedback focusing on 1-2 key areas such as grammar, vocabulary choice, naturalness, or pronunciation (if context suggests it, e.g., "you could say X more clearly like Y"). 
If the user's message is good, offer encouragement. 
Respond in JSON format as an array of objects, where each object has "type" (e.g., "grammar", "vocabulary", "fluency", "pronunciation", "general") and "message" (the feedback). If relevant, include a "suggestion".
Example: [{"type": "grammar", "message": "Minor grammar mix-up: 'I go yesterday' should be 'I went yesterday'.", "suggestion": "I went yesterday."}]
Example: [{"type": "general", "message": "Great job! Your sentence is clear and natural."}]
Example: [{"type": "vocabulary", "message": "Instead of 'very big', you could use 'enormous' or 'huge' for more impact.", "suggestion": "enormous, huge"}]
Provide only the JSON array.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "The type of feedback, e.g., 'grammar', 'vocabulary', 'fluency', 'pronunciation', 'general'."
              },
              message: {
                type: Type.STRING,
                description: "The constructive feedback message."
              },
              suggestion: {
                type: Type.STRING,
                description: "An optional suggestion for improvement."
              }
            },
            required: ["type", "message"]
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text);
    if (Array.isArray(parsedData)) {
      // Validate structure, though it's simple here
      return parsedData.filter(item => item.type && item.message) as FeedbackItem[];
    }
    return [{ type: "general", message: "Received feedback in an unexpected format." }];

  } catch (error) {
    console.error("Error getting feedback from Gemini:", error);
    // Return a generic error feedback item
    return [{ type: "general", message: "Sorry, I couldn't generate feedback at this time." }];
  }
};


export const getHintSuggestions = async (
  scenarioContext: string, 
  lastUserMessage: string | null, 
  lastAiMessage: string | null
): Promise<string[]> => {
  let prompt = `The user is practicing English in a conversation scenario: "${scenarioContext}".\n`;
  if (lastUserMessage) prompt += `Their last message was: "${lastUserMessage}"\n`;
  if (lastAiMessage) prompt += `The AI's last response was: "${lastAiMessage}"\n`;
  prompt += `The user is stuck and needs help. Suggest 2-3 simple and relevant English phrases or questions they could say next to continue the conversation or ask for clarification.
Respond ONLY with a JSON array of strings. Example: ["What do you mean by that?", "Can you tell me more?", "I'm not sure what to say next."]`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      }
    });

    const parsedData = JSON.parse(response.text);
    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
      return parsedData as string[];
    }
    return ["Sorry, couldn't fetch suggestions in the expected format."];
  } catch (error) {
    console.error("Error getting hint suggestions from Gemini:", error);
    return ["Sorry, I couldn't get suggestions right now."];
  }
};


// Interface for GroundingAttribution.GroundingChunk (subset for web)
interface GroundingAttribution_GroundingChunk {
  web?: GroundingAttribution_WebAttribution;
  // Potentially other types like retrievedContext, etc.
}
// Interface for GroundingAttribution.WebAttribution
interface GroundingAttribution_WebAttribution {
  uri: string;
  title?: string;
}