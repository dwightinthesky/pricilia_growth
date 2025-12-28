// src/utils/howieAI.js

// ⚠️ 請確保 .env 檔案中有 VITE_GEMINI_API_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const askHowie = async (userText) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
    You are Howie, a smart Life OS assistant.
    Analyze the user input and categorize it into one of these 4 types:

    1. "schedule": Event with specific date/time (e.g., meeting, class).
    2. "task": One-off to-do item (e.g., buy milk, call mom).
    3. "finance": Expense or bill (e.g., pay rent, bought coffee).
    4. "goal": Long-term objective or skill acquisition (e.g., learn Spanish, lose weight, save $10k).

    User Input: "${userText}"
    Current Time: ${new Date().toLocaleString()}

    Return a STRICT JSON object (no markdown) with fields:
    {
      "type": "schedule" | "task" | "finance" | "goal",
      "title": "Concise title",
      "date": "YYYY-MM-DD" (for schedule/task/finance),
      "time": "HH:mm" (24h),
      "amount": number (for finance),
      "priority": "High" | "Medium" | "Low",
      
      // Fields specific for 'goal':
      "category": "Career" | "Language" | "Health" | "Finance" | "Other" (infer from context),
      "deadline": "YYYY-MM-DD" (if mentioned, e.g. "by end of year")
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // 清理 JSON (移除 markdown 標籤)
    const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Howie Brain Error:", error);
    throw new Error("Howie 腦袋打結了 (API Error)，請檢查 Key 或網路。");
  }
};
