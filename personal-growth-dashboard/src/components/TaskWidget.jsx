import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Loader2, ListTodo } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // 🔥

const CategoryBadge = ({ category }) => {
    const colors = {
        Admin: 'bg-stone-100 text-stone-700 border-stone-200',
        Learning: 'bg-orange-50 text-orange-800 border-orange-100',
        Tech: 'bg-sky-50 text-sky-800 border-sky-100',
        Finance: 'bg-emerald-50 text-emerald-800 border-emerald-100',
        Other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colors[category] || colors['Other']}`}>{category}</span>;
};

const TaskWidget = () => {
    const { currentUser: user } = useAuth();
    const { t } = useTranslation(); // 🔥
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { setTasks([]); setLoading(false); return; }

        // Initial load
        setTasks(storage.get(STORAGE_KEYS.TASKS));
        setLoading(false);

        // Subscribe to changes
        const unsubscribe = storage.subscribe(STORAGE_KEYS.TASKS, (data) => {
            setTasks(data); // In a real app we might filter here, but for local demo we show all
        });
        return unsubscribe;
    }, [user]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !user) return;
        try {
            storage.add(STORAGE_KEYS.TASKS, {
                userId: user.uid,
                title: newTaskTitle,
                category: "Other",
                priority: "Medium",
                completed: false,
                createdAt: new Date().toISOString()
            });
            setNewTaskTitle('');
        } catch (err) { console.error(err); }
    };

    const toggleTask = async (taskId, currentStatus) => {
        storage.update(STORAGE_KEYS.TASKS, taskId, { completed: !currentStatus });
    };

    const deleteTask = async (taskId) => {
        if (window.confirm(t('tasks.delete_confirm'))) { // 🔥
            storage.remove(STORAGE_KEYS.TASKS, taskId);
        }
    };

    return (
        <div className="bg-white p-5 rounded-[2rem] h-full flex flex-col border-0">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2 text-neutral-500">
                    <ListTodo size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5">{t('tasks.title')}</span> {/* 🔥 */}
                </div>
                {loading && <Loader2 className="animate-spin text-stone-300" size={14} />}
            </div>

            <form onSubmit={handleAddTask} className="mb-4 relative">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder={t('tasks.placeholder')} // 🔥
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
                <button type="submit" disabled={!newTaskTitle.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black text-white rounded-md hover:opacity-80 disabled:opacity-30 transition-all">
                    <Plus size={14} />
                </button>
            </form>

            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[300px]">
                {tasks.length === 0 ? (
                    <div className="text-center text-stone-400 py-8 text-xs">{t('tasks.empty')}</div> // 🔥
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2.5 border border-stone-100 rounded-xl hover:border-stone-300 transition-all group bg-white">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button onClick={() => toggleTask(task.id, task.completed)} className={`transition-colors ${task.completed ? 'text-green-500' : 'text-stone-300 hover:text-black'}`}>
                                    {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </button>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${task.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{task.title}</p>
                                    {task.category && task.category !== 'Other' && (
                                        <div className="mt-0.5">
                                            <CategoryBadge category={task.category} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-all p-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskWidget;
