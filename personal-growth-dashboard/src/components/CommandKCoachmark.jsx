import React, { useEffect, useState } from "react";

const KEY = "pricilia.seenCommandK.v1";

export default function CommandKCoachmark() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try {
            const seen = localStorage.getItem(KEY);
            if (!seen) setOpen(true);
        } catch {
            setOpen(true);
        }
    }, []);

    if (!open) return null;

    const dismiss = () => {
        try {
            localStorage.setItem(KEY, "1");
        } catch { }
        setOpen(false);
    };

    return (
        <div className="fixed bottom-5 right-5 z-[70] w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="text-xs font-extrabold tracking-wide text-slate-500">PRO TIP</div>
            <div className="mt-1 text-sm font-extrabold text-slate-900">
                Press <span className="rounded-lg bg-slate-100 px-2 py-1">⌘K</span> to search anything
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-600">
                Jump to events, create schedules, and navigate faster.
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-400">Try it now</div>
                <button
                    onClick={dismiss}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:opacity-90"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
