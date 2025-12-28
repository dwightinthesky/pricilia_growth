// -----------------------------------------------------------------------------
// Gemini API Helper Function
// -----------------------------------------------------------------------------
export const callGemini = async (prompt) => {
    // Use env variable or fallback (You can replace this with your actual key during dev if env not set)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const makeRequest = async (retryCount = 0) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                if (response.status === 429 && retryCount < 3) {
                    // Simple backoff
                    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
                    return makeRequest(retryCount + 1);
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，AI 暫時無法回應。";
        } catch (error) {
            console.error("Gemini Request Failed", error);
            return "連線發生錯誤，請稍後再試。";
        }
    };

    return makeRequest();
};
