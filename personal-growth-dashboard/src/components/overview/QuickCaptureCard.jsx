import React, { useMemo, useState } from "react";
import { Sparkles, ArrowRight, Calendar, Wallet, Target } from "lucide-react";

function guessType(text) {
    const t = (text || "").toLowerCase();
    if (t.includes("€") || t.includes("eur") || t.includes("rent") || t.includes("spotify") || t.includes("bill")) return "finance";
    if (t.includes("every") || t.includes("weekly") || t.includes("monthly") || t.includes("每") || t.includes("房租")) return "finance";
    if (t.includes("goal") || t.includes("learn") || t.includes("達成") || t.includes("目標")) return "goal";
    return "schedule";
}

function TypePill({ type }) {
    const meta = {
        schedule: { label: "Schedule", Icon: Calendar },
        goal: { label: "Goal", Icon: Target },
        finance: { label: "Finance", Icon: Wallet },
    }[type] || { label: "Capture", Icon: Sparkles };
    const Icon = meta.Icon;

    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-extrabold tracking-widest text-white/80">
            <Icon size={14} className="text-white/70" />
            <span>{meta.label.toUpperCase()}</span>
        </div>
    );
}

export default function QuickCaptureCard({ onCapture }) {
    const [text, setText] = useState("");

    const type = useMemo(() => guessType(text), [text]);
    const canSend = text.trim().length > 0;

    const submit = async () => {
        if (!canSend) return;
        const payload = { text: text.trim(), type, createdAt: new Date().toISOString() };
        setText("");
        onCapture && onCapture(payload);
    };

    return (
        <div className="rounded-[2rem] border border-white/10 bg-[#0B1220] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/50 uppercase">Quick Capture</div>
                        <div className="mt-2 text-xl font-extrabold tracking-tight">Type once. We’ll organize it.</div>
                        <div className="mt-1 text-sm text-white/60">
                            Examples: “Tomorrow 14:00 rehearsal”, “Spotify €11.99 monthly”, “Finish MA homework”
                        </div>
                    </div>
                    <div className="shrink-0">
                        <div className="inline-flex items-center rounded-full bg-[#F3F27A] px-3 py-1 text-[11px] font-extrabold tracking-widest text-black">
                            AUTO
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add a task, schedule, or bill…"
                        rows={3}
                        className="w-full resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#F3F27A]/50"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <TypePill type={type} />
                        <button
                            onClick={submit}
                            disabled={!canSend}
                            className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-[11px] font-extrabold tracking-widest uppercase disabled:opacity-40"
                        >
                            Save <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
