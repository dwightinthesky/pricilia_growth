import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, X, Trash2, Edit2 } from 'lucide-react';

const defaultSkills = [
    { id: 1, name: 'Python', progress: 60, target: '80%' },
    { id: 2, name: 'React', progress: 85, target: 'Advanced' },
    { id: 3, name: 'UI/UX Design', progress: 40, target: 'Portfolio Ready' },
    { id: 4, name: 'Data Structures', progress: 30, target: 'Interview Prep' },
];

const SkillTracker = () => {
    const [skills, setSkills] = useState(() => {
        const saved = localStorage.getItem('pgd_skills');
        return saved ? JSON.parse(saved) : defaultSkills;
    });

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newSkill, setNewSkill] = useState({ name: '', progress: 50, target: '' });

    useEffect(() => {
        localStorage.setItem('pgd_skills', JSON.stringify(skills));
    }, [skills]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newSkill.name || !newSkill.target) return;

        if (editingId) {
            setSkills(skills.map(s => s.id === editingId ? { ...newSkill, id: editingId } : s));
            setEditingId(null);
        } else {
            setSkills([...skills, { ...newSkill, id: Date.now() }]);
        }

        setNewSkill({ name: '', progress: 50, target: '' });
        setIsAdding(false);
    };

    const startEdit = (skill) => {
        setNewSkill(skill);
        setEditingId(skill.id);
        setIsAdding(true);
    };

    const cancelEdit = () => {
        setNewSkill({ name: '', progress: 50, target: '' });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        setSkills(skills.filter(s => s.id !== id));
    };

    return (
        <div className="bento-card p-6 h-full flex flex-col group relative">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-neutral-500">
                    <Zap size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">SKILL GROWTH</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={isAdding ? cancelEdit : () => setIsAdding(true)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-pricilia-blue transition-colors"
                    >
                        {isAdding ? <X size={14} /> : <Plus size={14} />}
                    </button>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="mb-6 bg-slate-50 p-4 rounded-xl animate-in slide-in-from-top-2">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Skill Name (e.g. Rust)"
                            className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-pricilia-blue"
                            value={newSkill.name}
                            onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Target Goal (e.g. Advanced)"
                            className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-pricilia-blue"
                            value={newSkill.target}
                            onChange={e => setNewSkill({ ...newSkill, target: e.target.value })}
                        />
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-12">{newSkill.progress}%</span>
                            <input
                                type="range"
                                min="0" max="100"
                                value={newSkill.progress}
                                onChange={e => setNewSkill({ ...newSkill, progress: parseInt(e.target.value) })}
                                className="flex-1 accent-pricilia-blue h-1.5"
                            />
                        </div>
                        <button type="submit" className="w-full btn-primary py-2 text-xs">
                            {editingId ? 'Update Skill' : 'Add Skill'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6 overflow-y-auto scrollbar-hide pr-1 -mr-1">
                {skills.map((skill) => (
                    <div key={skill.id} className="group/item relative">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-base font-medium text-gray-900">{skill.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 font-medium">{skill.target}</span>
                                <span className="text-sm font-bold text-pricilia-blue">{skill.progress}%</span>
                                <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 absolute -right-14 top-0 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-md shadow-sm">
                                    <button
                                        onClick={() => startEdit(skill)}
                                        className="p-1 text-slate-400 hover:text-pricilia-blue transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(skill.id)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.progress}%` }}
                                transition={{ duration: 1, ease: "circOut" }}
                                className="h-full bg-pricilia-blue rounded-full relative"
                            >
                                <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r from-transparent to-white/20" />
                            </motion.div>
                        </div>
                    </div>
                ))}

                {skills.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No skills tracked yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillTracker;
