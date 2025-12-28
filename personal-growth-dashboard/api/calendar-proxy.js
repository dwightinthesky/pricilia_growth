export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        // 1. 後端直接去抓取 iCal 檔案
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch calendar: ${response.status}`);
        }

        const data = await response.text();

        // 2. 設定 header 允許跨域 (雖然在同個 domain 下通常不需要，但保險起見)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');

        // 3. 回傳純文字資料
        return res.status(200).send(data);

    } catch (error) {
        console.error("Calendar Proxy Error:", error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
