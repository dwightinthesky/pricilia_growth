import React from 'react';

import { Flame } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const HabitHeatmap = () => {
    const { t } = useTranslation();
    // Mock data for the heatmap
    const days = 100;

    const generateHeatmap = () => {
        return Array.from({ length: days }).map((_, i) => ({
            date: i,
            level: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0
        }));
    };

    const data = generateHeatmap();

    return (
        <div className="bento-card p-6 h-full flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-white to-slate-50">
            <div className="absolute top-6 left-6 flex items-center space-x-2 text-neutral-500">
                <Flame size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('heatmap.consistency')}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center max-w-[280px] mt-8">
                {data.map((day, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-[2px] transition-all duration-300 hover:scale-125 ${day.level === 0 ? 'bg-slate-100' :
                            day.level === 1 ? 'bg-indigo-100' :
                                day.level === 2 ? 'bg-indigo-300' :
                                    day.level === 3 ? 'bg-indigo-500' :
                                        'bg-pricilia-blue'
                            }`}
                        title={`Activity Level: ${day.level}`}
                    />
                ))}
            </div>

            <div className="mt-8 flex items-center justify-end space-x-2 text-[10px] text-slate-400 font-medium w-full px-4">
                <span>{t('heatmap.less')}</span>
                <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-100" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-300" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-pricilia-blue" />
                </div>
                <span>{t('heatmap.more')}</span>
            </div>
        </div>
    );
};

export default HabitHeatmap;
