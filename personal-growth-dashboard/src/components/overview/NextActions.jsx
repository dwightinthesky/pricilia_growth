import React from 'react';
import { Clock } from 'lucide-react';

function NextItem({ event, highlight, muted }) {
    const start = event?.start ? new Date(event.start) : null;
    const end = event?.end ? new Date(event.end) : null;

    const timeStr = start && end
        ? `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}–${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`
        : 'TBD';

    return (
        <div className={`py-3 border-b border-slate-100 last:border-0 ${muted ? 'opacity-40' : ''}`}>
            <div className="flex items-start gap-3">
                {highlight && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                )}
                <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold tracking-wide ${highlight ? 'text-slate-500' : 'text-slate-400'} mb-1`}>
                        {timeStr}
                    </div>
                    <div className={` font-extrabold ${highlight ? 'text-slate-900 text-base' : 'text-slate-600 text-sm'}`}>
                        {event?.title || 'Untitled Event'}
                    </div>
                    {event?.location && (
                        <div className="text-xs text-slate-500 mt-1">
                            {event.location}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function NextActions({ events = [] }) {
    const upcomingEvents = events
        .filter(e => new Date(e.start) > new Date())
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 5);

    return (
        <div className="overview-card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="overview-section-title text-xs tracking-[0.18em] text-slate-400">NEXT</h3>
                <Clock className="w-4 h-4 text-slate-400" />
            </div>

            {upcomingEvents.length === 0 ? (
                <div className="text-sm text-slate-500 py-8 text-center">
                    No upcoming events. You're free!
                </div>
            ) : (
                <div>
                    {upcomingEvents.map((event, idx) => (
                        <NextItem
                            key={event.id || idx}
                            event={event}
                            highlight={idx === 0}
                            muted={idx > 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
