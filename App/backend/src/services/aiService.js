import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8001";

export async function analyzeLog(message, type) {
  try {
    const response = await axios.post(`${AI_ENGINE_URL}/analyze`, {
      message,
      type
    });

    return response.data;
  } catch (error) {
    console.error("AI engine error:", error.message);

    // fallback so system never crashes
    return {
      risk_score: 20,
      risk_level: "LOW",
      source: "fallback"
    };
  }
}
