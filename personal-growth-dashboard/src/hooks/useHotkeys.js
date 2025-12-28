import { useEffect } from "react";

export default function useHotkeys(keys, handler) {
    useEffect(() => {
        const onKeyDown = (e) => {
            const target = e.target;
            const isTyping =
                target &&
                (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

            if (isTyping) return;

            const combo = [];
            if (e.metaKey) combo.push("meta");
            if (e.ctrlKey) combo.push("ctrl");
            if (e.shiftKey) combo.push("shift");
            combo.push(e.key.toLowerCase());

            if (keys.includes(combo.join("+"))) {
                e.preventDefault();
                handler(e);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [keys, handler]);
}
