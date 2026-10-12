import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log(
    "API Key Check:",
    process.env.GEMINI_API_KEY ? "Loaded successfully" : "Missing!",
  );

  try {
    const { prompt } = req.body;
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return res.status(200).json({ text: response.text ?? "返答なし" });
  } catch (error) {
    console.error("Gemini API Error details:", error);
    // エラーオブジェクトの構造に合わせてメッセージとステータスを抽出
    const errorMessage =
      error.message || JSON.stringify(error) || "Internal Server Error";
    const statusCode = error.status || error.statusCode || 500;

    return res.status(Number(statusCode)).json({
      error: errorMessage,
      status: statusCode,
      details: error.errorDetails || null,
    });
  }
}
