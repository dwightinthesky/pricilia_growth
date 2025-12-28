import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Plus, Trophy, BookOpen, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

import { useTranslation } from 'react-i18next';

const ExtraUpPage = () => {
    const { t } = useTranslation();
    const { currentUser: user, loading: loadingUser } = useAuth();
    const [goals, setGoals] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // 新增目標的暫存狀態
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalCategory, setNewGoalCategory] = useState('Career');

    // 🔥 1. 即時監聽雲端資料 -> 本地資料
    useEffect(() => {
        if (!user) {
            setGoals([]);
            setLoadingData(false);
            return;
        }

        // Initial load
        setGoals(storage.get(STORAGE_KEYS.GOALS));
        setLoadingData(false);

        // Subscribe
        const unsubscribe = storage.subscribe(STORAGE_KEYS.GOALS, (data) => {
            setGoals(data);
        });

        return () => unsubscribe();
    }, [user]);

    // 新增目標
    const handleAddGoal = async () => {
        if (!newGoalTitle.trim() || !user) return;
        storage.add(STORAGE_KEYS.GOALS, {
            userId: user.uid,
            title: newGoalTitle,
            category: newGoalCategory,
            progress: 0,
            milestones: [
                { id: Date.now().toString(), title: "Step 1", completed: false }
            ],
            createdAt: new Date().toISOString()
        });
        setShowAddModal(false);
        setNewGoalTitle('');
    };

    // 切換里程碑狀態
    const toggleMilestone = async (goal, milestoneId) => {
        const newMilestones = goal.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        // 重新計算進度
        const newProgress = Math.round((newMilestones.filter(m => m.completed).length / newMilestones.length) * 100);

        storage.update(STORAGE_KEYS.GOALS, goal.id, {
            milestones: newMilestones,
            progress: newProgress
        });
    };

    // 新增里程碑
    const addMilestone = async (goal) => {
        const title = prompt("輸入新的里程碑名稱：");
        if (!title) return;
        const newMilestones = [...goal.milestones, { id: Date.now().toString(), title, completed: false }];
        // 進度會變低
        const newProgress = Math.round((newMilestones.filter(m => m.completed).length / newMilestones.length) * 100);

        storage.update(STORAGE_KEYS.GOALS, goal.id, {
            milestones: newMilestones,
            progress: newProgress
        });
    };

    const deleteGoal = async (id) => {
        if (window.confirm("確定要放棄這個目標嗎？")) {
            storage.remove(STORAGE_KEYS.GOALS, id);
        }
    };

    if (loadingUser || loadingData) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-stone-400" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-500">

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight flex items-center">
                        <Target className="mr-3 text-indigo-600" size={32} />
                        {t('goals.title')}
                    </h1>
                    <p className="text-stone-500 text-sm mt-2">{t('goals.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-stone-800 transition-colors"
                >
                    <Plus size={16} className="mr-2" /> {t('goals.new_goal')}
                </button>
            </div>

            {/* 新增目標 Modal */}
            {showAddModal && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-stone-200 shadow-sm animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-sm mb-2">{t('goals.create_title')}</h3>
                    <div className="flex gap-2">
                        <input
                            className="flex-1 border rounded-lg px-3 py-2 text-sm"
                            placeholder={t('goals.placeholder_title')}
                            value={newGoalTitle}
                            onChange={e => setNewGoalTitle(e.target.value)}
                        />
                        <select
                            className="border rounded-lg px-3 py-2 text-sm bg-white"
                            value={newGoalCategory}
                            onChange={e => setNewGoalCategory(e.target.value)}
                        >
                            <option value="Career">Career</option>
                            <option value="Language">Language</option>
                            <option value="Health">Health</option>
                            <option value="Other">Other</option>
                        </select>
                        <button onClick={handleAddGoal} className="bg-indigo-600 text-white px-4 rounded-lg text-sm font-bold">{t('goals.add')}</button>
                        <button onClick={() => setShowAddModal(false)} className="text-stone-400 px-2">{t('goals.cancel')}</button>
                    </div>
                </div>
            )}

            {!user ? (
                <div className="text-center text-stone-400 py-20">{t('goals.login_msg')}</div>
            ) : goals.length === 0 ? (
                <div className="text-center text-stone-400 py-20">{t('goals.empty')}</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {goals.map(goal => (
                        <div key={goal.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            {/* 卡片頭部 */}
                            <div
                                className="p-6 cursor-pointer flex justify-between items-center"
                                onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-3 rounded-xl ${goal.progress === 100 ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-600'}`}>
                                        {goal.progress === 100 ? <Trophy size={24} /> : <BookOpen size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-lg text-stone-800">{goal.title}</h3>
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{goal.category}</span>
                                        </div>
                                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden flex items-center">
                                            <div
                                                className={`h-full transition-all duration-700 ${goal.progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                                                style={{ width: `${goal.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-xs text-stone-400">{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} {t('goals.milestones')}</span>
                                            <span className="text-xs font-bold text-stone-600">{goal.progress}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-4 text-stone-400">
                                    {expandedId === goal.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* 展開的里程碑區域 */}
                            {expandedId === goal.id && (
                                <div className="bg-stone-50 border-t border-stone-100 p-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">{t('goals.milestones')}</h4>
                                        <button onClick={() => addMilestone(goal)} className="text-xs text-indigo-600 hover:underline flex items-center"><Plus size={12} className="mr-1" /> {t('goals.add_step')}</button>
                                    </div>
                                    <div className="space-y-3">
                                        {goal.milestones.map(milestone => (
                                            <div
                                                key={milestone.id}
                                                onClick={() => toggleMilestone(goal, milestone.id)}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <div className={`transition-colors ${milestone.completed ? 'text-green-500' : 'text-stone-300 group-hover:text-stone-400'}`}>
                                                    {milestone.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </div>
                                                <span className={`text-sm ${milestone.completed ? 'text-stone-400 line-through' : 'text-stone-700 font-medium'}`}>
                                                    {milestone.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex justify-end border-t border-stone-200 pt-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 size={14} /> {t('goals.delete_goal')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExtraUpPage;
