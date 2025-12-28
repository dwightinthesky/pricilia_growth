import React from 'react';
import { Sparkles } from 'lucide-react';

export default function HowieAIButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
        >
            <Sparkles size={18} className="text-yellow-400" />
            <span className="font-extrabold text-sm">Ask Howie</span>
        </button>
    );
}
