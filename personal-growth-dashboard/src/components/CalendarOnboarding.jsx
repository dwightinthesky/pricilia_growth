import React, { useState } from 'react';
import { Calendar, Link, Upload, CheckCircle2, X, HelpCircle, FileText, Globe, Cloud, AlertTriangle, ArrowRight } from 'lucide-react';
import ICAL from 'ical.js';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

const CalendarOnboarding = ({ isOpen, onClose, onSave }) => {
    const { currentUser: user } = useAuth();
    const [activeTab, setActiveTab] = useState('url'); // 'url', 'file', 'cloud'
    const [icalUrl, setIcalUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [instructions, setInstructions] = useState(null);
    const [verifyResult, setVerifyResult] = useState(null); // 為 null 代表未驗證

    // Cloudflare Worker URL from env
    const WORKER_URL = import.meta.env.VITE_CAL_WORKER_URL;

    // Helper to save to Local Storage
    const saveToLocal = async (data) => {
        if (!user) return;
        try {
            storage.upsert(STORAGE_KEYS.USER_CONFIG, {
                id: user.uid,
                ...data
            });
        } catch (error) {
            throw new Error("Storage Error: " + error.message);
        }
    };

    // 1. Verify URL (Call Worker /verify)
    const handleVerify = async () => {
        if (!icalUrl) return;
        if (!WORKER_URL) {
            alert("System Error: Worker URL not configured. Please check .env");
            return;
        }

        setIsProcessing(true);
        setVerifyResult(null);

        try {
            const res = await fetch(`${WORKER_URL}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ icalUrl }),
            });

            if (!res.ok) throw new Error("Verification failed");

            const data = await res.json();
            setVerifyResult(data);
        } catch (error) {
            alert("Verification Failed: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // 2. Sync URL (Call Worker /sync & Save)
    const handleSync = async () => {
        if (!icalUrl || !user || !WORKER_URL) return;
        setIsProcessing(true);

        try {
            const res = await fetch(`${WORKER_URL}/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ icalUrl }),
            });

            if (!res.ok) throw new Error("Sync failed");
            const data = await res.json();

            // Store in Local Storage
            await saveToLocal({
                calendarType: "url",
                calendarSource: icalUrl,
                calendar: { type: "url", source: icalUrl, syncedAt: new Date(), eventCount: data.count, events: data.events },
            });

            onSave && onSave();
            onClose();
        } catch (error) {
            alert("Sync Failed: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // 3. File Upload (Client-side Parse)
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const fileContent = event.target.result;
                try {
                    const jcal = ICAL.parse(fileContent);
                    const comp = new ICAL.Component(jcal);
                    const vevents = comp.getAllSubcomponents("vevent");

                    const events = vevents.map(ev => {
                        const evt = new ICAL.Event(ev);
                        return {
                            title: evt.summary,
                            start: evt.startDate.toJSDate(),
                            end: evt.endDate.toJSDate(),
                            location: evt.location
                        };
                    });

                    await saveToLocal({
                        calendarType: 'file',
                        calendarSource: fileContent,
                        calendar: {
                            type: 'file',
                            syncedAt: new Date(),
                            eventCount: events.length,
                            events: events
                        }
                    });

                    onSave && onSave();
                    onClose();
                } catch (err) {
                    throw new Error("Invalid iCal file");
                }
            } catch (error) {
                alert(error.message);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">Connect Calendar</h2>
                        <p className="text-xs text-stone-500 mt-1">Sync your school or personal schedule.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <X size={20} className="text-stone-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-stone-50 mx-6 mt-6 rounded-lg shrink-0">
                    <button onClick={() => setActiveTab('url')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center ${activeTab === 'url' ? 'bg-white shadow-sm text-black' : 'text-stone-400'}`}>
                        <Link size={14} className="mr-2" /> Live Sync
                    </button>
                    <button onClick={() => setActiveTab('cloud')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center ${activeTab === 'cloud' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-400'}`}>
                        <Cloud size={14} className="mr-2" /> Guides
                    </button>
                    <button onClick={() => setActiveTab('file')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center ${activeTab === 'file' ? 'bg-white shadow-sm text-black' : 'text-stone-400'}`}>
                        <FileText size={14} className="mr-2" /> Upload .ics
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto">

                    {/* 1. Live Sync (URL) */}
                    {activeTab === 'url' && (
                        <div className="space-y-6">
                            {!verifyResult ? (
                                // Step 1: Input URL and Verify
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-700">iCal URL</label>
                                        <input
                                            type="text"
                                            value={icalUrl}
                                            onChange={(e) => setIcalUrl(e.target.value)}
                                            placeholder="https://example.com/calendar.ics"
                                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        />
                                        <p className="text-[10px] text-stone-400">
                                            Paste your Orbit, Google, or Apple Calendar public URL here.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleVerify}
                                        disabled={isProcessing || !icalUrl}
                                        className="w-full bg-black text-white font-bold py-3 rounded-lg text-sm hover:bg-stone-800 transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        {isProcessing ? "Verifying..." : "Verify Connection"}
                                    </button>
                                </>
                            ) : (
                                // Step 2: Verification Result (Preview)
                                <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 size={18} className="text-green-600" />
                                            <span className="font-bold text-green-900 text-sm">Calendar Found!</span>
                                            <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">
                                                {verifyResult.count} Events
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {verifyResult.sampleEvents && verifyResult.sampleEvents.map((evt, i) => (
                                                <div key={i} className="flex gap-3 text-xs bg-white/60 p-2 rounded-lg border border-green-100/50">
                                                    <div className="w-1 bg-green-400 rounded-full"></div>
                                                    <div className="overflow-hidden">
                                                        <div className="font-bold text-green-900 truncate">{evt.title}</div>
                                                        <div className="text-green-700 opacity-80">{new Date(evt.start).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setVerifyResult(null)}
                                            className="flex-1 border border-stone-200 text-stone-600 font-bold py-3 rounded-lg text-sm hover:bg-stone-50 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSync}
                                            disabled={isProcessing}
                                            className="flex-[2] bg-black text-white font-bold py-3 rounded-lg text-sm hover:bg-stone-800 transition-all flex items-center justify-center shadow-lg shadow-green-900/10"
                                        >
                                            {isProcessing ? "Syncing..." : "Confirm & Sync"} <ArrowRight size={16} className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. Guides (Content Unchanged) */}
                    {activeTab === 'cloud' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <h4 className="text-indigo-900 font-bold text-sm mb-2">How to connect major providers?</h4>
                                <div className="space-y-2">
                                    <button onClick={() => setInstructions('google')} className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs font-bold text-stone-600 border border-indigo-100 hover:border-indigo-300 flex justify-between items-center">
                                        <span>Google Calendar</span> <HelpCircle size={14} />
                                    </button>
                                    {instructions === 'google' && (
                                        <div className="text-[10px] text-stone-500 px-2 pl-4 border-l-2 border-indigo-200">
                                            1. Go to Google Calendar &gt; Settings<br />
                                            2. Select your calendar on left<br />
                                            3. Scroll to "Integrate calendar"<br />
                                            4. Copy <b>"Secret address in iCal format"</b>
                                        </div>
                                    )}

                                    <button onClick={() => setInstructions('apple')} className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs font-bold text-stone-600 border border-indigo-100 hover:border-indigo-300 flex justify-between items-center">
                                        <span>Apple iCloud</span> <HelpCircle size={14} />
                                    </button>
                                    {instructions === 'apple' && (
                                        <div className="text-[10px] text-stone-500 px-2 pl-4 border-l-2 border-indigo-200">
                                            1. Open Apple Calendar (Mac/iOS)<br />
                                            2. Click (i) next to calendar<br />
                                            3. Enable "Public Calendar"<br />
                                            4. Copy link (change webcal:// to https://)
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setActiveTab('url')} className="w-full border border-stone-200 text-stone-600 font-bold py-3 rounded-lg text-sm hover:bg-stone-50 transition-all">
                                I have the link, go to paste
                            </button>
                        </div>
                    )}

                    {/* 3. File Upload (Content Slightly Refined) */}
                    {activeTab === 'file' && (
                        <div className="space-y-4">
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept=".ics"
                                    onChange={handleFileUpload}
                                    disabled={isProcessing}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center justify-center group-hover:border-stone-400 group-hover:bg-stone-50 transition-all text-stone-400 group-hover:text-stone-600">
                                    <Upload size={32} className="mb-2" />
                                    <span className="text-xs font-bold">Click to upload .ics file</span>
                                    <span className="text-[10px] mt-1 opacity-70">Static import (Won't auto-update)</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CalendarOnboarding;
