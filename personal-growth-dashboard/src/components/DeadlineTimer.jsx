import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Settings, X, GraduationCap, User, Link as LinkIcon, Save } from 'lucide-react';
import ICAL from 'ical.js';
import { fetchUserCalendar } from '../utils/calendarUtils';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import CalendarOnboarding from './CalendarOnboarding';

// 🧹 清潔工具
const cleanLocation = (rawLoc) => {
    if (!rawLoc) return "TBA";
    const match = rawLoc.match(/CHP_([^\/]+)/);
    if (match) return match[1];
    return rawLoc.replace(/Paris|Champerret|Montparnasse|Campus/gi, '').replace(/^[-\s,]+/, '').trim();
};

const extractProfessor = (htmlDesc) => {
    if (!htmlDesc) return "";
    const regex = /(?:Professor|Enseignant|Teacher|Instructor).*?(?:&#58;|:)\s*(.*?)(?:<br|\n|$)/i;
    const match = htmlDesc.match(regex);
    if (match && match[1]) return match[1].replace(/<[^>]*>/g, '').trim();
    return "";
};

const DeadlineTimer = () => {
    const { t } = useTranslation();
    const { currentUser: user } = useAuth(); // Local Auth

    // 個人目標狀態
    const [title, setTitle] = useState(() => localStorage.getItem('dl_title') || 'PROJECT DEMO');
    const [targetDate, setTargetDate] = useState(() => {
        const saved = localStorage.getItem('dl_date');
        if (saved) return new Date(saved);
        const d = new Date();
        d.setHours(23, 0, 0, 0);
        return d;
    });
    const [location, setLocation] = useState(() => localStorage.getItem('dl_location') || 'UR WAY TO SUCCEED');
    const [useDefaultSlogan, setUseDefaultSlogan] = useState(() => localStorage.getItem('dl_use_slogan') === 'true');

    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 編輯模式暫存
    const [editTitle, setEditTitle] = useState(title);
    const [editDate, setEditDate] = useState('');
    const [editLocation, setEditLocation] = useState(location);
    const [editUseSlogan, setEditUseSlogan] = useState(useDefaultSlogan);

    // 學校行事曆狀態
    const [nextClass, setNextClass] = useState(null);
    const [classTimeLeft, setClassTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
    const [classLoading, setClassLoading] = useState(false);
    const [hasCalendar, setHasCalendar] = useState(false); // 是否有連結日曆

    // 1. 個人倒數計時邏輯 (Local Storage only - already done by original code using localStorage directly)
    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff > 0) {
                setTimeLeft({
                    hours: Math.floor(diff / (1000 * 60 * 60)),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
                setIsExpired(false);
            } else {
                setIsExpired(true);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };
        const timer = setInterval(calculateTime, 1000);
        calculateTime();
        return () => clearInterval(timer);
    }, [targetDate]);

    const handleSave = () => {
        if (!editTitle.trim() || !editDate) return;
        setTitle(editTitle);
        const newDate = new Date(editDate);
        setTargetDate(newDate);
        setLocation(editLocation);
        setUseDefaultSlogan(editUseSlogan);
        localStorage.setItem('dl_title', editTitle);
        localStorage.setItem('dl_date', newDate.toISOString());
        localStorage.setItem('dl_location', editLocation);
        localStorage.setItem('dl_use_slogan', String(editUseSlogan));
        setIsEditing(false);
    };

    const openEditMode = () => {
        setEditTitle(title);
        setEditLocation(location);
        setEditUseSlogan(useDefaultSlogan);
        const d = new Date(targetDate);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setEditDate(d.toISOString().slice(0, 16));
        setIsEditing(true);
    };

    // 2. 學校行事曆邏輯 (Local Storage Config)
    const DEFAULT_CALENDAR_URL = "https://orbit.escp.eu/api/calendars/getSpecificCalendar/2f6b7c9855f563b1ad9d3f5e221a2d60f3f3fdb2";

    useEffect(() => {
        const loadSchedule = async (sourceData) => {
            try {
                setClassLoading(true);
                const events = await fetchUserCalendar(sourceData);
                processNextClass(events);
            } catch (e) {
                console.error("Timer Schedule Error", e);
            } finally {
                setClassLoading(false);
            }
        };

        if (!user) {
            setHasCalendar(false);
            loadSchedule({ calendarType: 'url', calendarSource: DEFAULT_CALENDAR_URL });
            return;
        }

        const checkConfig = (configs) => {
            const myConfig = configs.find(c => c.id === user.uid);
            if (myConfig && myConfig.calendarSource) {
                setHasCalendar(true);
                loadSchedule(myConfig);
            } else {
                setHasCalendar(false);
                loadSchedule({ calendarType: 'url', calendarSource: DEFAULT_CALENDAR_URL });
            }
        };

        // Initial
        checkConfig(storage.get(STORAGE_KEYS.USER_CONFIG));

        // Subscribe
        const unsub = storage.subscribe(STORAGE_KEYS.USER_CONFIG, (configs) => {
            checkConfig(configs);
        });
        return () => unsub();
    }, [user]);

    const processNextClass = (events) => {
        const now = new Date();
        const upcoming = events
            .filter(ev => ev.start > now)
            .sort((a, b) => a.start - b.start);

        if (upcoming.length > 0) {
            const next = upcoming[0];
            setNextClass({
                courseName: next.title.split(' - ')[0],
                startTime: next.start,
                location: cleanLocation(next.location),
                professor: extractProfessor(next.description)
            });
        } else {
            setNextClass(null);
        }
    };

    // 下一堂課倒數
    useEffect(() => {
        if (!nextClass) return;
        const timer = setInterval(() => {
            const now = new Date();
            const diff = nextClass.startTime - now;

            if (diff > 0) {
                setClassTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                    totalSeconds: Math.floor(diff / 1000),
                    totalHoursOnly: Math.floor(diff / (1000 * 60 * 60))
                });
            } else {
                setClassTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, totalHoursOnly: 0 });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [nextClass]);

    const f = (num) => String(num).padStart(2, '0');
    const displayLocation = useDefaultSlogan ? "UR WAY TO SUCCEED" : location;

    return (
        <div className="relative h-full w-full rounded-[2rem] overflow-hidden flex flex-col font-sans group border-0 bg-white">

            {/* 編輯模式 Overlay */}
            {isEditing && (
                <div className="absolute inset-0 bg-black z-50 p-8 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
                        <div className="flex items-center text-white">
                            <Settings size={18} className="mr-2 text-neutral-400" />
                            <span className="text-sm font-bold uppercase tracking-widest">{t('timer.settings')}</span>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-neutral-900 transition-colors">
                            <X size={20} className="text-neutral-500 hover:text-white" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="text-xs text-neutral-500 font-bold uppercase tracking-wider block mb-2">{t('timer.goal_title')}</label>
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder-neutral-600" />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 font-bold uppercase tracking-wider block mb-2">{t('timer.target_date')}</label>
                            <input type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all [color-scheme:dark]" />
                        </div>
                        <button onClick={handleSave} className="w-full mt-6 bg-white text-black py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center justify-center shadow-lg">
                            <Save size={16} className="mr-2" /> {t('timer.save_changes')}
                        </button>
                    </div>
                </div>
            )}

            {/* 上半部：黑色計時器 */}
            {/* 🔥 修改：p-8 改為 p-6，mb-4 改為 mb-6，h-5 確保高度 */}
            <div className="bg-black text-white relative flex flex-col p-6 flex-1 transition-all border-b border-neutral-800">
                <div className="flex justify-between items-center z-10 mb-6 h-5">
                    <div className="flex items-center space-x-2 text-neutral-500">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5">{t('timer.title')}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button onClick={openEditMode} className="text-neutral-500 hover:text-white transition-colors duration-300">
                            <Settings size={14} />
                        </button>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isExpired ? 'bg-red-500' : 'bg-green-500 strong-pulse-dot'}`}></span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-start z-10 overflow-hidden">
                    {/* 🔥 修改 1：字體再縮小至 text-xl (手機) / text-2xl (電腦) */}
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight mb-1 text-left truncate w-full" title={title}>
                        {title}
                    </h2>
                    <div className="font-mono text-5xl text-neutral-400 font-medium tracking-tighter leading-none text-left">
                        {isExpired ? (
                            <span className="text-red-500 text-3xl">{t('timer.expired')}</span>
                        ) : (
                            <>
                                <span className="text-white">{f(timeLeft.hours)}</span>
                                <span className="mx-1">:</span>
                                <span className="text-white">{f(timeLeft.minutes)}</span>
                                <span className="text-neutral-600 text-3xl ml-1">:{f(timeLeft.seconds)}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="text-[11px] text-neutral-500 font-medium flex items-center mt-4 uppercase tracking-wide">
                    <MapPin size={12} className="mr-1.5" />
                    <span>{displayLocation}</span>
                </div>
            </div>

            {/* 下半部：白色計時器 (Next Class) - 🔥 調整間距 */}
            <div className="bg-white text-black flex-1 p-6 flex flex-col justify-between">

                {/* Header 間距縮小 mb-4 -> mb-2 */}
                <div className="flex items-center space-x-2 text-neutral-500 mb-2 h-5">
                    <GraduationCap size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5">{t('timer.next_class')}</span>
                </div>

                <div className="flex-1 flex flex-col justify-center items-start w-full">
                    {!nextClass && !classLoading ? (
                        <div className="text-left">
                            <h2 className="text-xl font-bold text-neutral-300">{t('timer.no_classes')}</h2>
                            {!hasCalendar && (
                                <p className="text-sm text-neutral-400 mt-1 flex items-center">
                                    <LinkIcon size={12} className="mr-1" /> {t('timer.link_calendar')}
                                </p>
                            )}
                        </div>
                    ) : classLoading ? (
                        <div className="flex flex-col items-start w-full animate-pulse">
                            <div className="h-8 w-3/4 bg-neutral-100 rounded mb-2"></div>
                            <div className="h-12 w-1/2 bg-neutral-100 rounded"></div>
                        </div>
                    ) : (
                        <>
                            {/* 🔥 修改 2：字體同步縮小至 text-xl / text-2xl */}
                            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight leading-tight mb-1 text-left w-full break-words line-clamp-2" title={nextClass.courseName}>
                                {nextClass.courseName}
                            </h2>
                            <div className="font-mono text-5xl text-neutral-300 font-medium tracking-tighter leading-none text-left">
                                <span className="text-neutral-900">{classTimeLeft.totalHoursOnly}</span>
                                <span className="mx-1">:</span>
                                <span className="text-neutral-900">{f(classTimeLeft.minutes)}</span>
                                <span className="text-neutral-300 text-3xl ml-1">:{f(classTimeLeft.seconds)}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* 🔥 上方間距縮小 mt-6 -> mt-3，內部間距縮小 pt-4 -> pt-3 */}
                {nextClass && (
                    <div className="mt-3 flex flex-row items-center gap-6 border-t border-neutral-100 pt-3 w-full">
                        <div className="flex items-center text-[11px] text-neutral-500 font-medium uppercase tracking-wide">
                            <MapPin size={14} className="mr-2 text-neutral-400" />
                            <span className="truncate max-w-[100px]">{nextClass.location}</span>
                        </div>
                        {nextClass.professor && (
                            <div className="flex items-center text-[11px] text-neutral-500 font-medium uppercase tracking-wide">
                                <User size={14} className="mr-2 text-neutral-400" />
                                <span className="truncate max-w-[120px]">{nextClass.professor}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeadlineTimer;
