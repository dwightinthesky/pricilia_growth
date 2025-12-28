import React from "react";

function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarEventCard({ event }) {
    const metaLeft = event.location ? event.location : event.resource || "";
    const metaRight =
        event.start && event.end ? `${formatTime(event.start)}–${formatTime(event.end)}` : "";

    return (
        <div className="min-w-0">
            <div className="truncate text-[12px] font-extrabold leading-tight">
                {event.title}
            </div>

            <div className="mt-0.5 flex items-center justify-between gap-2">
                <div className="truncate text-[11px] font-semibold opacity-70">
                    {metaLeft}
                </div>
                <div className="shrink-0 text-[11px] font-semibold opacity-70">
                    {metaRight}
                </div>
            </div>
        </div>
    );
}
