import ICAL from 'ical.js';

// 通用的 iCal 解析器
export const parseICalData = (icalText) => {
    try {
        const jcalData = ICAL.parse(icalText);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        return vevents.map(ev => {
            const event = new ICAL.Event(ev);
            return {
                title: event.summary,
                start: event.startDate.toJSDate(),
                end: event.endDate.toJSDate(),
                location: event.location || 'TBA',
                description: event.description || ''
            };
        });
    } catch (e) {
        console.error("Parse Error", e);
        return [];
    }
};

// 統一的資料獲取函數
export const fetchUserCalendar = async (userDoc) => {
    if (!userDoc) return [];

    const { calendarType, calendarSource } = userDoc;

    // 1. 如果是檔案模式，直接解析儲存的字串
    if (calendarType === 'file' && calendarSource) {
        return parseICalData(calendarSource);
    }

    // 2. 如果是連結模式，透過 Proxy 抓取
    if (calendarType === 'url' && calendarSource) {
        try {
            // 使用 corsproxy.io
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(calendarSource)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error("Network error");
            const text = await response.text();
            return parseICalData(text);
        } catch (error) {
            console.error("Fetch failed:", error);
            return [];
        }
    }

    return [];
};
