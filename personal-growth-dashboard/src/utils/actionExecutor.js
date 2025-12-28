// src/utils/actionExecutor.js
import { storage, STORAGE_KEYS } from './storage';

export const executeHowieAction = async (aiData, userId) => {
    // userId is optional now for local storage, but keeping signature

    switch (aiData.type) {
        // 1. 任務 (Task)
        case 'task':
            storage.add(STORAGE_KEYS.TASKS, {
                userId,
                title: aiData.title,
                priority: aiData.priority || 'Medium',
                completed: false,
                category: 'Other', // 預設分類
                createdAt: new Date().toISOString()
            });
            return `✅ 已將「${aiData.title}」加入待辦清單！`;

        // 2. 行程 (Schedule)
        case 'schedule':
            storage.add(STORAGE_KEYS.EVENTS, {
                userId,
                title: aiData.title,
                start: `${aiData.date}T${aiData.time || '09:00'}`, // 若沒說時間預設早上9點
                duration: 60,
                location: aiData.location || 'TBA',
                createdAt: new Date().toISOString()
            });
            return `📅 已為您安排行程：「${aiData.title}」。`;

        // 3. 財務 (Finance) -- mapped to chores in original code?
        case 'finance':
            storage.add(STORAGE_KEYS.CHORES, {
                userId,
                title: aiData.title,
                amount: aiData.amount || 0,
                type: 'bill',
                frequency: 'One-time',
                lastCompleted: null,
                createdAt: new Date().toISOString()
            });
            return `💰 已記錄支出：「${aiData.title}」金額 $${aiData.amount}。`;

        // 🔥 4. 新增：目標 (Goal)
        case 'goal':
            storage.add(STORAGE_KEYS.GOALS, {
                userId,
                title: aiData.title,
                category: aiData.category || 'Other',
                progress: 0,
                milestones: [
                    // 自動幫使用者建立第一步，降低開始的門檻
                    { id: Date.now().toString(), title: "第一步：制定具體計畫", completed: false }
                ],
                createdAt: new Date().toISOString()
            });
            return `🏆 目標設定成功！已將「${aiData.title}」加入 Extra*up。加油！`;

        default:
            return "🤔 Howie 不太確定這是什麼類型，無法儲存。";
    }
};
