import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Trash2, Edit2, Droplets, BookOpen, Dumbbell, Zap } from 'lucide-react';

const defaultHabits = [
    { id: 1, name: 'Drink Water', type: 'health', progress: 3, target: 8, icon: 'droplets' },
    { id: 2, name: 'Reading', type: 'growth', progress: 15, target: 30, icon: 'book' },
    { id: 3, name: 'Exercise', type: 'health', progress: 1, target: 1, icon: 'dumbbell' },
    { id: 4, name: 'Meditation', type: 'mind', progress: 0, target: 1, icon: 'zap' },
];

const icons = {
    droplets: Droplets,
    book: BookOpen,
    dumbbell: Dumbbell,
    zap: Zap,
};

const HabitTracker = () => {
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('pgd_habits');
        return saved ? JSON.parse(saved) : defaultHabits;
    });

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newHabit, setNewHabit] = useState({ name: '', progress: 0, target: 1, icon: 'zap' });

    useEffect(() => {
        localStorage.setItem('pgd_habits', JSON.stringify(habits));
    }, [habits]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newHabit.name) return;

        if (editingId) {
            setHabits(habits.map(h => h.id === editingId ? { ...newHabit, id: editingId } : h));
            setEditingId(null);
        } else {
            setHabits([...habits, { ...newHabit, id: Date.now() }]);
        }

        setNewHabit({ name: '', progress: 0, target: 1, icon: 'zap' });
        setIsAdding(false);
    };

    const deleteHabit = (id) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    const incrementProgress = (id) => {
        setHabits(habits.map(h => {
            if (h.id === id) {
                const next = h.progress + 1;
                return { ...h, progress: next > h.target ? 0 : next }; // Reset if over target, or cap? Let's cycle for now or cap.
                // Actually cycle might be annoying. Let's cap, but maybe reset to 0 if full?
                // User requirement: "Click can increase progress".
                // Let's increment. If full, maybe just stay full or toggle?
                // Let's implement: Click increments. If >= target, it stays completed visually, but maybe we can reset manually?
                // Refined: If < target, increment. If == target, reset to 0 (toggle style) or keep?
                // Let's do cycle for simple interaction: 0 -> 1 -> ... -> target -> 0
            }
            return h;
        }));
    };

    const startEdit = (habit) => {
        setNewHabit(habit);
        setEditingId(habit.id);
        setIsAdding(true);
    };

    const cancelEdit = () => {
        setNewHabit({ name: '', progress: 0, target: 1, icon: 'zap' });
        setEditingId(null);
        setIsAdding(false);
    };

    return (
        <div className="bento-card p-6 h-full flex flex-col group relative">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-neutral-500">
                    <Zap size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">HABIT TRACKER</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={isAdding ? cancelEdit : () => setIsAdding(true)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-pricilia-blue transition-colors"
                    >
                        {isAdding ? <X size={14} /> : <Plus size={14} />}
                    </button>
                    {/* Only showing the add button to keep it clean, removed the extra icon box since we have the header icon now */}
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="mb-6 bg-slate-50 p-4 rounded-xl animate-in slide-in-from-top-2">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Habit Name"
                            className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-pricilia-blue"
                            value={newHabit.name}
                            onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                placeholder="Target"
                                className="w-20 text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-pricilia-blue"
                                value={newHabit.target}
                                onChange={e => setNewHabit({ ...newHabit, target: parseInt(e.target.value) })}
                            />
                            <select
                                className="flex-1 text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-pricilia-blue bg-white"
                                value={newHabit.icon}
                                onChange={e => setNewHabit({ ...newHabit, icon: e.target.value })}
                            >
                                <option value="zap">General</option>
                                <option value="droplets">Water</option>
                                <option value="book">Reading</option>
                                <option value="dumbbell">Fitness</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full btn-primary py-2 text-xs">
                            {editingId ? 'Update Habit' : 'Add Habit'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4 overflow-y-auto scrollbar-hide pr-1 -mr-1">
                {habits.map((habit) => {
                    const Icon = icons[habit.icon] || Zap;
                    const percent = Math.min((habit.progress / habit.target) * 100, 100);

                    return (
                        <div key={habit.id} className="group/item relative bg-white border border-slate-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${percent === 100 ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700">{habit.name}</h4>
                                        <span className="text-xs text-slate-400">
                                            {habit.progress} / {habit.target}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => incrementProgress(habit.id)}
                                    className="p-1.5 rounded-full hover:bg-slate-50 text-pricilia-blue font-bold text-xs border border-transparent hover:border-slate-200 transition-all"
                                >
                                    +1
                                </button>
                            </div>

                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(habit)} className="p-1 text-slate-300 hover:text-pricilia-blue"><Edit2 size={12} /></button>
                                <button onClick={() => deleteHabit(habit.id)} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
                            </div>

                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className={`h-full rounded-full ${percent === 100 ? 'bg-green-500' : 'bg-pricilia-blue'}`}
                                />
                            </div>
                        </div>
                    );
                })}

                {habits.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        Start tracking a new habit!
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitTracker;
