
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AIAssistance } from '../types';

export const getAIAssistance = async (question: Question): Promise<AIAssistance | null> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY is not set.");
        // Simulate a response for local development without an API key
        const randomOptionIndex = Math.floor(Math.random() * 4);
        const randomConfidence = 75 + Math.floor(Math.random() * 20);
        return {
          suggestedAnswer: ['A', 'B', 'C', 'D'][randomOptionIndex] as 'A' | 'B' | 'C' | 'D',
          confidence: randomConfidence,
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
            You are an expert in Chemistry. Analyze the following multiple-choice question from a quiz game and determine the most likely correct answer.
            
            Question: "${question.question}"
            
            Options:
            A. ${question.options[0]}
            B. ${question.options[1]}
            C. ${question.options[2]}
            D. ${question.options[3]}
            
            Provide your answer as a JSON object with two keys: 'suggestedAnswer' (which should be 'A', 'B', 'C', or 'D') and 'confidence' (a number between 0 and 100 representing your certainty).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedAnswer: {
                            type: Type.STRING,
                            description: "The suggested answer option ('A', 'B', 'C', or 'D')."
                        },
                        confidence: {
                            type: Type.NUMBER,
                            description: "The confidence level from 0 to 100."
                        }
                    },
                    required: ["suggestedAnswer", "confidence"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (['A', 'B', 'C', 'D'].includes(parsedResponse.suggestedAnswer) && typeof parsedResponse.confidence === 'number') {
            return parsedResponse as AIAssistance;
        } else {
            throw new Error("Invalid response format from AI");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
};
