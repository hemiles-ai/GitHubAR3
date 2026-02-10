
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RecognitionResult } from "../types";

const getApiKey = () => {
  try {
    return (window as any).process?.env?.API_KEY || process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const RECOGNITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Short, impactful name of the object" },
    category: { type: Type.STRING, description: "Object classification (e.g., Tech, Architecture, Flora)" },
    description: { type: Type.STRING, description: "Concise summary of what this object is" },
    funFact: { type: Type.STRING, description: "Deep lore or interesting history about this type of object" },
    visualPrompt: { type: Type.STRING, description: "A cinematic noir prompt to reimagine this object" },
    confidence: { type: Type.NUMBER, description: "AI confidence 0-1" },
    tacticalAnalysis: { type: Type.STRING, description: "A 'tactical' or 'technical' breakdown of the object's purpose" },
    materialComposition: { type: Type.STRING, description: "Estimated materials (e.g., Polymer, Steel, Carbon Fiber)" }
  },
  required: ["name", "category", "description", "funFact", "visualPrompt", "confidence", "tacticalAnalysis", "materialComposition"]
};

export async function recognizeObject(
  base64Image: string,
  clickX: number,
  clickY: number
): Promise<RecognitionResult | null> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API_KEY_MISSING");
    
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Perform a high-precision identification of the object at coordinates (${Math.round(clickX)}%, ${Math.round(clickY)}%) in the provided image. 
    Provide a professional, tactical, and slightly futuristic intelligence report.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RECOGNITION_SCHEMA
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text) as RecognitionResult;
  } catch (error) {
    console.error("Recognition failure:", error);
    return null;
  }
}

export async function speakMessage(text: string): Promise<void> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return;
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.warn("TTS_ERROR:", error);
  }
}

export async function generateAIVisual(prompt: string): Promise<string | null> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `A futuristic holographic blueprint style render of: ${prompt}. High contrast, blueprint blue and white lines, cinematic lighting.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imagePart ? `data:image/png;base64,${imagePart.inlineData.data}` : null;
  } catch (error) {
    console.error("VISUAL_GEN_ERROR:", error);
    return null;
  }
}
