import React, { useState, useEffect } from 'react';
import {
    CheckCircle2, Circle, Clock, Briefcase, Play, Pause, RotateCcw,
    ChevronLeft, Sparkles, Loader2, RefreshCw, ArrowUpDown, Plus, Wand2, Send, Zap, Trash2
} from 'lucide-react';
import { callGemini } from '../services/gemini';

// --- Sub-Components ---

const CategoryBadge = ({ category }) => {
    const colors = {
        Admin: 'bg-stone-100 text-stone-700 border-stone-200',
        Learning: 'bg-orange-50 text-orange-800 border-orange-100',
        Tech: 'bg-sky-50 text-sky-800 border-sky-100',
        Finance: 'bg-emerald-50 text-emerald-800 border-emerald-100',
        Other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
        <span className={`text-[10px] font-bold px-3 py-1 rounded-md border ${colors[category] || colors['Other']}`}>
            {category}
        </span>
    );
};

const AiTaskCreator = ({ onTaskCreated }) => {
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleMagicAdd = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);

        const prompt = `
      Analyze this user input for a new task: "${input}"
      
      Extract the following details and return ONLY a valid JSON object (no markdown, no extra text):
      {
        "title": "Concise task title",
        "category": "One of: Admin, Learning, Tech, Finance, Other (infer based on context)",
        "priority": "High, Medium, or Low (infer based on urgency)",
        "duration": number (estimated minutes, default to 30 if unknown),
        "notes": "Brief context or details mentioned",
        "subtasks": [
           {"id": "1", "title": "Logical step 1", "completed": false},
           {"id": "2", "title": "Logical step 2", "completed": false}
        ]
      }
      If language is Chinese, keep title/notes in Chinese.
    `;

        try {
            const result = await callGemini(prompt);
            const cleanJson = result.replace(/```json\n?|\n?```/g, '').trim();
            const taskData = JSON.parse(cleanJson);
            onTaskCreated(taskData);
            setInput('');
        } catch (error) {
            console.error("Failed to parse task", error);
            // Fallback manual add
            onTaskCreated({ title: input, category: 'Other', priority: 'Medium', duration: 30, notes: '', subtasks: [] });
            setInput('');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="mb-4 bg-white border border-stone-200 rounded-xl p-2 shadow-sm flex items-center group focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
            <div className="p-2 text-stone-400 group-focus-within:text-purple-600 transition-colors">
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMagicAdd()}
                placeholder="Ask AI to add a task... (e.g. 'Plan my Japan trip')"
                disabled={isProcessing}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-stone-800 placeholder-stone-400 h-full py-1 focus:outline-none"
            />
            <button
                onClick={handleMagicAdd}
                disabled={isProcessing || !input.trim()}
                className="mx-1 p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors disabled:opacity-50"
            >
                <Plus size={16} />
            </button>
        </div>
    );
};

const DashboardStrategy = ({ tasks }) => {
    const [strategy, setStrategy] = useState('');
    const [loading, setLoading] = useState(false);

    const generateStrategy = async () => {
        setLoading(true);
        const incompleteTasks = tasks.filter(t => !t.completed);
        const taskSummary = incompleteTasks.map(t => `- ${t.title} (${t.priority}, ${t.category}, ${t.duration}m)`).join('\n');

        const prompt = `
      Act as a professional productivity coach.
      Tasks remaining:
      ${taskSummary}
      
      Provide a concise 2-sentence plan on execution order.
      End with a short, punchy motivational quote.
      Respond in Traditional Chinese.
    `;

        const result = await callGemini(prompt);
        setStrategy(result);
        setLoading(false);
    };

    return (
        <div className="mb-4 bg-stone-50 border border-stone-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="text-amber-500" size={14} />
                    <span className="text-xs font-bold text-stone-700">Daily Strategist</span>
                </div>
                <button
                    onClick={generateStrategy}
                    disabled={loading}
                    className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-1"
                >
                    {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    {strategy ? 'Regenerate' : 'Generate'}
                </button>
            </div>
            {strategy && (
                <div className="mt-2 text-xs text-stone-600 leading-relaxed animate-in fade-in whitespace-pre-wrap">
                    {strategy}
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------
// Custom CSS Animation (Breathing Glow)
// ----------------------------------------------------
const breathingStyle = `
  @keyframes breathing-glow {
    0% {
      box-shadow: 0 0 0 0px rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.4);
    }
    50% {
      box-shadow: 0 0 15px 5px rgba(99, 102, 241, 0.5);
      border-color: rgba(99, 102, 241, 1);
    }
    100% {
      box-shadow: 0 0 0 0px rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.4);
    }
  }

  .breathing-active {
    animation: breathing-glow 3s ease-in-out infinite;
  }
`;

const Timer = ({ duration, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (onComplete) onComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration * 60);
    };

    return (
        <div className="flex flex-col items-center py-6">
            <style>{breathingStyle}</style>

            <div
                className={`relative flex items-center justify-center w-64 h-64 rounded-full border-4 transition-all duration-500 mb-8 ${isActive
                    ? 'breathing-active bg-white'
                    : 'border-stone-200 bg-stone-50'
                    }`}
            >
                <div className="text-center z-10">
                    <div className={`text-6xl font-bold font-mono tracking-tight transition-colors ${isActive ? 'text-indigo-600' : 'text-stone-700'
                        }`}>
                        {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-stone-400 mt-2 font-medium tracking-wider uppercase">
                        {isActive ? 'Focusing...' : 'Ready'}
                    </div>
                </div>

                {isActive && (
                    <div className="absolute inset-2 rounded-full border border-indigo-100 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-all shadow-sm active:scale-95"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={toggleTimer}
                    className={`h-12 px-8 rounded-full flex items-center justify-center font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 ${isActive
                        ? 'bg-white border border-indigo-200 text-indigo-600 hover:border-indigo-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent'
                        }`}
                >
                    {isActive ? (
                        <><Pause size={18} className="mr-2" fill="currentColor" /> Pause</>
                    ) : (
                        <><Play size={18} className="mr-2" fill="currentColor" /> Start Focus</>
                    )}
                </button>
            </div>
        </div>
    );
};

const AiAssistant = ({ task }) => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (customPrompt = null) => {
        setLoading(true);
        const userQuery = customPrompt || input;
        const fullPrompt = `Task: ${task.title}. Context: ${task.notes || 'None'}. User Query: ${userQuery}. Provide helpful advice in Traditional Chinese.`;

        const result = await callGemini(fullPrompt);
        setResponse(result);
        setLoading(false);
        if (!customPrompt) setInput('');
    };

    return (
        <div className="mt-6 border-t border-stone-100 pt-6">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-900 flex items-center">
                        <Sparkles className="mr-1.5" size={12} /> AI Assistant
                    </span>
                    <span className="text-[10px] uppercase text-stone-400 font-bold">Gemini 2.0</span>
                </div>
                {response && (
                    <div className="mb-3 bg-white rounded-lg p-3 text-sm text-stone-700 leading-relaxed border border-stone-200 shadow-sm animate-in fade-in">
                        {response}
                    </div>
                )}
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for help..."
                        className="w-full bg-white border border-stone-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-stone-500 shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="absolute right-1.5 p-1 bg-black text-white rounded hover:bg-stone-800 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const TodoList = () => {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('pgd_ai_tasks');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Learn Gemini API', completed: false, category: 'Tech', priority: 'High', duration: 45, notes: 'Read docs', subtasks: [] },
            { id: 2, title: 'Review PRs', completed: false, category: 'Tech', priority: 'Medium', duration: 30, notes: '', subtasks: [] }
        ];
    });

    const [activeTaskId, setActiveTaskId] = useState(null);
    const activeTask = tasks.find(t => t.id === activeTaskId);

    useEffect(() => {
        localStorage.setItem('pgd_ai_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (newTask) => {
        setTasks([{ ...newTask, id: Date.now(), completed: false, subtasks: newTask.subtasks || [] }, ...tasks]);
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
        if (activeTaskId === id) setActiveTaskId(null);
    };

    // Focus View
    if (activeTask) {
        return (
            <div className="bento-card h-full flex flex-col p-6 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden relative">
                <button
                    onClick={() => setActiveTaskId(null)}
                    className="absolute top-6 left-6 flex items-center text-xs font-bold text-stone-400 hover:text-stone-800"
                >
                    <ChevronLeft size={14} className="mr-1" /> BACK
                </button>

                <div className="mt-8 flex-1 overflow-y-auto scrollbar-hide">
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-2">
                            <CategoryBadge category={activeTask.category} />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-900">{activeTask.title}</h2>
                        <div className="text-xs text-stone-400 mt-1 flex items-center justify-center font-medium">
                            <Clock size={10} className="mr-1" /> {activeTask.duration} mins
                        </div>
                    </div>

                    <Timer duration={activeTask.duration} onComplete={() => toggleTask(activeTask.id)} />

                    <div className="space-y-4 max-w-lg mx-auto">
                        <div>
                            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Notes</h3>
                            <p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-100">{activeTask.notes || 'No notes provided.'}</p>
                        </div>

                        {activeTask.subtasks && activeTask.subtasks.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Checklist</h3>
                                <div className="space-y-1">
                                    {activeTask.subtasks.map(st => (
                                        <div key={st.id} className="flex items-center text-sm p-2 bg-stone-50 rounded border border-stone-100">
                                            <div className="w-4 h-4 rounded border border-stone-300 mr-2 bg-white"></div>
                                            <span className="text-stone-700">{st.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <AiAssistant task={activeTask} />
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="bento-card h-full flex flex-col p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 text-neutral-500">
                    <Briefcase size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">MY TASKS</span>
                </div>
                <span className="text-[10px] font-medium bg-stone-100 px-2 py-0.5 rounded-full text-stone-500">
                    {tasks.filter(t => !t.completed).length} pending
                </span>
            </div>

            <AiTaskCreator onTaskCreated={addTask} />
            <DashboardStrategy tasks={tasks} />

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${task.completed ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-stone-200 hover:border-black'}`}
                        onClick={() => setActiveTaskId(task.id)}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.completed ? 'bg-black border-black text-white' : 'border-stone-300 hover:border-black text-transparent'}`}
                            >
                                <CheckCircle2 size={12} />
                            </button>
                            <div className="min-w-0">
                                <h4 className={`text-sm font-semibold truncate ${task.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{task.title}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <CategoryBadge category={task.category} />
                                    <span className="text-[10px] text-stone-400 flex items-center">
                                        <Clock size={10} className="mr-0.5" /> {task.duration}m
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                            <ChevronLeft size={14} className="text-stone-300 rotate-180" />
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-10 text-stone-400 text-sm">
                        <p>All clear! ✨</p>
                        <p className="text-xs mt-1">Use the magic wand to add tasks.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodoList;
