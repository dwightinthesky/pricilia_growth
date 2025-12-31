import React from 'react';
import { X, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import HowieCards from './HowieCards';
import ToneSwitch from './ToneSwitch';
import { useHowieMemory } from '../../hooks/useHowieMemory';

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
        setTone,
        remaining,
        limit
    } = controller;

    // Direct memory access for UI management
    const { memory, clear } = useHowieMemory();

    // Wrapped setter to update both hook state and local memory
    const changeTone = (t) => {
        setTone(t);
    };

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
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-10">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-extrabold text-slate-900">HowieAI</h2>
                            <p className="text-xs font-semibold text-slate-500">Growth Assistant</p>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5 ml-0">
                            {limit === Infinity ? (
                                <span>Unlimited</span>
                            ) : (
                                <span>{remaining} / {limit} credits left</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ToneSwitch value={tone} onChange={changeTone} />
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {/* Welcome / Presets */}
                    {!response && !isLoading && !error && (
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

                                <div className="text-right pt-2 px-1">
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {remaining} insights remaining today
                                    </span>
                                </div>
                            </div>

                            {/* Memory UI */}
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold text-slate-900">Howie Memory</div>
                                    <button
                                        onClick={() => {
                                            if (confirm("Clear Howie memory on this device?")) {
                                                clear();
                                                location.reload();
                                            }
                                        }}
                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div className="mt-2 text-xs text-slate-500">
                                    Saved locally on this device. Used to personalize suggestions.
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                                        Tone: {memory.tone}
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                                        Recent: {memory.recent.length}
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                                        Pinned: {memory.pinnedGoalIds.length}
                                    </span>
                                </div>
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
                        error === "HOWIE_LIMIT_REACHED" ? (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
                                <div className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                    <Sparkles size={16} />
                                    Howie needs a short break
                                </div>
                                <div className="text-amber-800 leading-relaxed">
                                    You've used all <b className="text-amber-950">{limit}</b> insights for today.
                                    I want to keep our sessions focused and high-quality.
                                    <br /><br />
                                    Come back tomorrow for a fresh perspective.
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start gap-2">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )
                    )}

                    {/* Response Display */}
                    {response && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <HowieCards howie={response} onRunAction={executeAction} />

                            <div className="text-center space-y-2">
                                <button
                                    onClick={() => askHowie("Continue optimizing")}
                                    className="w-full py-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {tone === 'strict'
                                        ? "Pick a session now."
                                        : tone === 'coach'
                                            ? "Let’s lock in one small win today."
                                            : "Want me to schedule a session for you?"}
                                </button>

                                <div className="text-[10px] text-slate-300 font-medium">
                                    Tone: {tone === "calm" ? "Balanced" : tone === "strict" ? "Direct" : "Encouraging"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
