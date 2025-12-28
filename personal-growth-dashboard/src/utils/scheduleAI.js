// src/utils/scheduleAI.js

// 這是一個將圖片轉換為標準課程 JSON 的 AI 函數
export const parseScheduleImage = async (base64Image, apiKey) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
    Analyze the uploaded image of a school schedule/timetable.
    Extract all class events and return a purely valid JSON array.
    
    The JSON structure for each event must be:
    {
      "title": "Course Name",
      "location": "Room/Building",
      "professor": "Professor Name (or empty string)",
      "dayOfWeek": 1, // 1 for Monday, 2 for Tuesday... 7 for Sunday
      "startTime": "HH:mm", // 24-hour format, e.g., "09:00"
      "endTime": "HH:mm"   // 24-hour format, e.g., "10:30"
    }

    Rules:
    1. Infer the day of the week based on column headers.
    2. If exact dates aren't visible, assume it's a recurring weekly schedule.
    3. Return ONLY the JSON array, no markdown formatting, no extra text.
  `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: base64Image.split(',')[1] } }
                    ]
                }]
            })
        });

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // 清理可能的回傳格式 (移除 markdown \`\`\`json ... \`\`\`)
        const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        throw new Error("無法辨識課表圖片，請確保圖片清晰。");
    }
};
