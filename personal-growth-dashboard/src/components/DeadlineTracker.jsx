import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, X, Edit2 } from 'lucide-react';

const defaultDeadlines = [
    { id: 1, subject: 'Linear Algebra', task: 'Problem Set 3', due: 'Oct 24', status: 'To Do', priority: 'High' },
    { id: 2, subject: 'History', task: 'Research Paper', due: 'Nov 01', status: 'In Progress', priority: 'Medium' },
    { id: 3, subject: 'Computer Science', task: 'Lab 4 Submission', due: 'Oct 20', status: 'Done', priority: 'High' },
    { id: 4, subject: 'Psychology', task: 'Reading Chapter 5', due: 'Oct 25', status: 'To Do', priority: 'Low' },
];

const DeadlineTracker = () => {
    const [deadlines, setDeadlines] = useState(() => {
        const saved = localStorage.getItem('pgd_deadlines');
        return saved ? JSON.parse(saved) : defaultDeadlines;
    });

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newDeadline, setNewDeadline] = useState({ subject: '', task: '', due: '', priority: 'Medium' });

    useEffect(() => {
        localStorage.setItem('pgd_deadlines', JSON.stringify(deadlines));
    }, [deadlines]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newDeadline.task) return;

        if (editingId) {
            setDeadlines(deadlines.map(t => t.id === editingId ? { ...newDeadline, id: editingId } : t));
            setEditingId(null);
        } else {
            setDeadlines([...deadlines, { ...newDeadline, id: Date.now(), status: 'To Do' }]);
        }

        setNewDeadline({ subject: '', task: '', due: '', priority: 'Medium' });
        setIsAdding(false);
    };

    const startEdit = (deadline) => {
        setNewDeadline(deadline);
        setEditingId(deadline.id);
        setIsAdding(true);
    };

    const cancelEdit = () => {
        setNewDeadline({ subject: '', task: '', due: '', priority: 'Medium' });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        setDeadlines(deadlines.filter(t => t.id !== id));
    };

    // Show top 5 for widget
    const widgetDeadlines = deadlines.slice(0, 5);

    return (
        <div className="bento-card h-full flex flex-col relative">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-pricilia-dark">Upcoming</h3>
                <div className="flex gap-2">
                    <button
                        onClick={isAdding ? cancelEdit : () => setIsAdding(true)}
                        className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-pricilia-dark transition-colors"
                    >
                        {isAdding ? <X size={16} /> : <Plus size={16} />}
                    </button>
                    <Clock size={18} className="text-pricilia-text" />
                </div>
            </div>

            {/* Add Form */}
            {isAdding && (
                <form onSubmit={handleAdd} className="p-4 bg-slate-50 border-b border-slate-100 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <input
                            placeholder="Task (e.g. Lab 4)"
                            className="w-full text-xs p-2 rounded border border-slate-200"
                            value={newDeadline.task}
                            onChange={e => setNewDeadline({ ...newDeadline, task: e.target.value })}
                        />
                        <input
                            placeholder="Subject (e.g. CS 101)"
                            className="w-full text-xs p-2 rounded border border-slate-200"
                            value={newDeadline.subject}
                            onChange={e => setNewDeadline({ ...newDeadline, subject: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <input
                                placeholder="Due Date"
                                className="w-1/2 text-xs p-2 rounded border border-slate-200"
                                value={newDeadline.due}
                                onChange={e => setNewDeadline({ ...newDeadline, due: e.target.value })}
                            />
                            <select
                                className="w-1/2 text-xs p-2 rounded border border-slate-200 bg-white"
                                value={newDeadline.priority}
                                onChange={e => setNewDeadline({ ...newDeadline, priority: e.target.value })}
                            >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                        <button className="w-full btn-primary py-1.5 text-xs">
                            {editingId ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            )}

            <div className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
                {widgetDeadlines.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-pricilia-dark group-hover:text-pricilia-blue transition-colors">
                                {item.task}
                            </span>
                            <span className="text-xs text-pricilia-text">{item.subject}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${item.priority === 'High' ? 'bg-red-50 text-red-500' :
                                item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                {item.due}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-pricilia-blue transition-opacity mr-1"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {deadlines.length === 0 && <div className="text-center text-xs text-slate-400 py-4">No deadlines</div>}
            </div>

            <div className="p-4 border-t border-slate-50 text-center">
                <span className="text-xs font-medium text-pricilia-blue cursor-pointer hover:underline">View all deadlines →</span>
            </div>
        </div>
    );
};

export default DeadlineTracker;
