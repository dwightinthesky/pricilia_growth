import React from 'react';
import { X, Sparkles, ArrowRight, Calendar, AlertCircle, Settings2 } from 'lucide-react';
import { useHowieAI } from '../../hooks/useHowieAI';
import { useAuth } from '../../context/AuthContext';

const PRESETS = [
    { label: "Plan my week", intent: "Analyze my goals and schedule, suggests a plan for this week." },
    { label: "Am I falling behind?", intent: "Check if I am falling behind on any Extra*up goals." },
    { label: "Optimize tomorrow", intent: "Look at tomorrow's schedule and suggest optimizations." },
];

export default function HowieAIPanel({ isOpen, onClose, controller }) {
    const {
        isLoading,
        response,
        error,
        askHowie,
        executeAction,
        tone,
        setTone
    } = controller;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Sparkles size={18} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900">HowieAI</h2>
                            <p className="text-xs font-semibold text-slate-500">Growth Assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tone Selector */}
                <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50 flex gap-2">
                    {['calm', 'strict', 'coach'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${tone === t
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {/* Welcome / Presets */}
                    {!response && !isLoading && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    Hi! I'm ready to help you optimize your rhythm.
                                    I have access to your <span className="font-bold text-slate-900">Goals</span> and <span className="font-bold text-slate-900">Schedule</span>.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider ml-1">Quick Actions</p>
                                {PRESETS.map((p) => (
                                    <button
                                        key={p.label}
                                        onClick={() => askHowie(p.intent)}
                                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-700 group-hover:text-indigo-700">{p.label}</span>
                                            <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
                            <p className="text-sm font-semibold text-slate-400 animate-pulse">
                                {tone === 'strict' ? 'Analyzing performance...' : 'Thinking...'}
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Response Display */}
                    {response && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Summary */}
                            <div className="flex gap-3">
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${response.status === 'behind' || response.status === 'overloaded' ? 'bg-amber-100' : 'bg-indigo-100'
                                    }`}>
                                    <Sparkles size={14} className={
                                        response.status === 'behind' || response.status === 'overloaded' ? 'text-amber-600' : 'text-indigo-600'
                                    } />
                                </div>
                                <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm text-sm font-medium text-slate-700 leading-relaxed">
                                    {response.summary}
                                </div>
                            </div>

                            {/* Cards (Recommendations) */}
                            {response.recommendations?.map((card, idx) => (
                                <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
                                    <h3 className="font-extrabold text-slate-900 mb-1">{card.title}</h3>
                                    <p className="text-xs text-slate-500 mb-2 font-medium leading-relaxed">{card.why}</p>

                                    {card.impact && (
                                        <div className="mb-4 flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 w-fit px-2 py-1 rounded-md">
                                            <Sparkles size={10} strokeWidth={3} />
                                            <span>Impact: {card.impact}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {card.actions?.map((action, actionIdx) => {
                                            const isPrimary = action.type === 'schedule_session' || action.type === 'create_event';
                                            return (
                                                <button
                                                    key={actionIdx}
                                                    onClick={() => executeAction(action)}
                                                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold active:scale-95 transition-all ${isPrimary
                                                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10"
                                                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                                        }`}
                                                >
                                                    {action.type === 'schedule_session' ? <Calendar size={14} /> : <ArrowRight size={14} />}
                                                    {action.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => askHowie("Continue optimizing")}
                                className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600"
                            >
                                Ask something else?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
