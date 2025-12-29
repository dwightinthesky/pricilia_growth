import React from "react";

const TONES = [
    { key: "calm", label: "Calm" },
    { key: "strict", label: "Strict" },
    { key: "coach", label: "Coach" },
];

export default function ToneSwitch({ value = "calm", onChange }) {
    return (
        <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
            {TONES.map((t) => {
                const active = value === t.key;
                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onChange?.(t.key)}
                        className={[
                            "px-3 py-1.5 text-xs font-semibold transition",
                            active
                                ? "bg-slate-900 text-white"
                                : "text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
