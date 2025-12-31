import React from "react";
import { ArrowRight, Zap } from "lucide-react";

export default function SpotlightCard({ title = "Today’s Focus", item, onOpen }) {
    const hasItem = !!item;

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-card overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2">
                        <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                            <Zap size={16} />
                        </div>
                        <div>
                            <div className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400 uppercase">{title}</div>
                            <div className="text-sm font-extrabold text-slate-900">One thing that moves you forward</div>
                        </div>
                    </div>

                    <button
                        onClick={() => hasItem && onOpen && onOpen(item)}
                        disabled={!hasItem}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-[11px] font-extrabold tracking-widest uppercase disabled:opacity-40"
                    >
                        Open <ArrowRight size={14} />
                    </button>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    {!hasItem ? (
                        <div className="text-sm text-slate-500">
                            Nothing urgent right now. Pick a goal to focus on.
                        </div>
                    ) : (
                        <>
                            <div className="text-base font-extrabold text-slate-900">{item.title}</div>
                            <div className="mt-1 text-sm text-slate-600">
                                {item.sub || "Linked to your schedule and goals"}
                            </div>
                            {item.meta && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {item.meta.map((m, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700"
                                        >
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
