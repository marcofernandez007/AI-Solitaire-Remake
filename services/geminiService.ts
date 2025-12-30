
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, Rank, Suit } from "../types";

const ORACLE_PROMPT = `You are the Zen Solitaire Oracle. 
A player is seeking your wisdom to solve their Solitaire game. 
Analyze the current board state and provide a concise, poetic, or tactical hint. 
If they are stuck, encourage them. If they have many moves, point out a strategic one. 
Always stay in character as a calm, wise guide.`;

export interface OracleResponse {
  message: string;
  isHint: boolean;
  suggestedAction?: string;
}

export const getOracleAdvice = async (gameState: GameState): Promise<OracleResponse> => {
  // Fix: Always instantiate GoogleGenAI inside the function right before the API call to ensure the most up-to-date API key is utilized.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const stateSummary = {
      stockCount: gameState.stock.length,
      wasteCount: gameState.waste.length,
      foundationProgress: gameState.foundation.map(f => f.length > 0 ? f[f.length - 1].rank : 0),
      tableauCounts: gameState.tableau.map(t => t.length),
      score: gameState.score,
      moves: gameState.moves
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current Board State: ${JSON.stringify(stateSummary)}. Give me some wisdom.`,
      config: {
        systemInstruction: ORACLE_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            isHint: { type: Type.BOOLEAN },
            suggestedAction: { type: Type.STRING }
          },
          required: ["message", "isHint"]
        }
      }
    });

    // Fix: Access the .text property directly and check for its existence as it can be undefined.
    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text received from the Oracle.");
    }

    return JSON.parse(responseText.trim()) as OracleResponse;
  } catch (error) {
    console.error("Oracle is silent:", error);
    return {
      message: "The winds are silent, but your intuition is loud. Continue your journey.",
      isHint: false
    };
  }
};
