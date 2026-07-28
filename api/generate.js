import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getOpenAIClient = () => {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
};

async function generateMuscleImage(targetMusclesEn) {
  const openai = getOpenAIClient();
  if (!openai) return null;

  try {
    const prompt = `A clear, medical-style anatomical illustration of a human body model focusing on muscle groups. Highlight the following primary muscles in bright glowing red color: ${targetMusclesEn}. Clean white background, 3D render, professional fitness atlas style.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url;
  } catch (error) {
    console.error("DALL-E 이미지 생성 실패:", error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { mode, payload } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (mode === 'recommend') {
      const prompt = `
        사용자 정보:
        - 체중: ${payload.weight}kg, 키: ${payload.height}cm, 나이: ${payload.age}세
        - 선택한 운동 부위: ${payload.targetCategory}
        - 선택한 난이도: ${payload.difficulty}

        위 정보를 바탕으로 불필요한 인사말이나 서론 없이 아래 JSON 포맷으로만 답변하세요.

        {
          "resultText": "맞춤 운동 추천 내용...",
          "targetMusclesEn": "Chest, Triceps"
        }
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      if (text.startsWith("```json")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsed = { resultText: text, targetMusclesEn: "Target muscles" };
      try { parsed = JSON.parse(text); } catch (e) {}

      const imageUrl = await generateMuscleImage(parsed.targetMusclesEn);
      return res.status(200).json({ text: parsed.resultText, imageUrl, targetMusclesEn: parsed.targetMusclesEn });

    } else if (mode === 'vision') {
      const base64Data = payload.imageBase64.split(',')[1] || payload.imageBase64;
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      };

      const prompt = `
        이 사진의 운동기구를 식별하고 아래 JSON 포맷으로만 답변하세요.

        {
          "resultText": "기구 분석 내용...",
          "targetMusclesEn": "Latissimus dorsi"
        }
      `;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text().trim();
      if (text.startsWith("```json")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsed = { resultText: text, targetMusclesEn: "Target muscle" };
      try { parsed = JSON.parse(text); } catch (e) {}

      const imageUrl = await generateMuscleImage(parsed.targetMusclesEn);
      return res.status(200).json({ text: parsed.resultText, imageUrl, targetMusclesEn: parsed.targetMusclesEn });
    }

    return res.status(400).json({ error: 'Invalid mode' });
  } catch (error) {
    console.error("API Handler Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
