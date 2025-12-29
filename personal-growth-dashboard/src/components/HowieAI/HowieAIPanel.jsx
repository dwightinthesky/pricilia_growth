import React from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useHowieAI } from '../../hooks/useHowieAI';
import HowieCards from './HowieCards';
import ToneSwitch from './ToneSwitch';
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
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-10">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900">HowieAI</h2>
                        <p className="text-xs font-semibold text-slate-500">Growth Assistant</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ToneSwitch value={tone} onChange={setTone} />
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
