import React from 'react';
import { useTranslation } from 'react-i18next';
import FullCalendar from '../components/FullCalendar';

const SchedulePage = () => {
    const { t } = useTranslation();

    return (
        <div className="h-screen flex flex-col bg-stone-50">
            {/* Page Header */}
            <div className="px-8 py-6 border-b border-stone-200 bg-white">
                <h1 className="text-3xl font-bold text-stone-900">{t('schedule.title')}</h1>
            </div>

            {/* Full Calendar - Main Stage */}
            <div className="flex-1 p-8 overflow-hidden">
                <FullCalendar height="100%" />
            </div>
        </div>
    );
};

export default SchedulePage;
