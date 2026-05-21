import axios from 'axios';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://192.168.56.128:8000";

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
