import { useEffect, useMemo, useState } from "react";

function pad2(n) {
    return String(Math.max(0, n)).padStart(2, "0");
}

function formatCountdown(ms) {
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    // Display hh:mm:ss if > 1 hour, otherwise mm:ss
    return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

export function useNextClassCountdown(nextClass) {
    const targetMs = useMemo(() => {
        if (!nextClass?.start) return null;
        const t = new Date(nextClass.start).getTime();
        return Number.isFinite(t) ? t : null;
    }, [nextClass?.start]);

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!targetMs) return;

        let intervalId = null;

        const tick = () => setNow(Date.now());

        const start = () => {
            if (intervalId) clearInterval(intervalId);
            const isHidden = typeof document !== "undefined" && document.hidden;
            intervalId = setInterval(tick, isHidden ? 30000 : 1000); // 1s foreground, 30s background
        };

        const onVisibility = () => start();

        start();
        if (typeof document !== "undefined") {
            document.addEventListener("visibilitychange", onVisibility);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (typeof document !== "undefined") {
                document.removeEventListener("visibilitychange", onVisibility);
            }
        };
    }, [targetMs]);

    if (!targetMs) return null;

    const msLeft = targetMs - now;

    // Class has started: show LIVE
    if (msLeft <= 0) {
        return { mode: "live", ms: 0, label: "LIVE NOW" };
    }

    return {
        mode: "countdown",
        ms: msLeft,
        label: formatCountdown(msLeft),
    };
}
