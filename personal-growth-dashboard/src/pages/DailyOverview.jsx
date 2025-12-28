import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // 🔥 Hook
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export default function DailyOverview() {
    const { t } = useTranslation();
    const { currentUser: user } = useAuth();
    const DEFAULT_IMG = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop';

    const [headerImage, setHeaderImage] = useState(DEFAULT_IMG);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    // 🔥 1. Sync from Local Storage
    useEffect(() => {
        if (!user) {
            setHeaderImage(DEFAULT_IMG);
            return;
        }

        const loadImg = (configs) => {
            const myConfig = configs.find(c => c.id === user.uid);
            if (myConfig && myConfig.hero_image_url) {
                setHeaderImage(myConfig.hero_image_url);
            } else {
                setHeaderImage(DEFAULT_IMG);
            }
        };

        // Initial
        loadImg(storage.get(STORAGE_KEYS.USER_CONFIG));

        // Subscribe
        const unsub = storage.subscribe(STORAGE_KEYS.USER_CONFIG, (configs) => {
            loadImg(configs);
        });
        return () => unsub();
    }, [user]);

    // 🔥 2. Upload to Local Storage (Base64)
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !user) return;

        try {
            setUploading(true);

            // Convert to Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;

                // Save to Storage
                const configs = storage.get(STORAGE_KEYS.USER_CONFIG);
                const myConfig = configs.find(c => c.id === user.uid) || { id: user.uid };
                myConfig.hero_image_url = base64;

                storage.upsert(STORAGE_KEYS.USER_CONFIG, myConfig);
                setUploading(false);
            };
            reader.readAsDataURL(file);

        } catch (err) {
            console.error("Upload failed", err);
            setUploading(false);
        }
    };

    const handleResetImage = async () => {
        if (!user) return;
        try {
            const configs = storage.get(STORAGE_KEYS.USER_CONFIG);
            const myConfig = configs.find(c => c.id === user.uid) || { id: user.uid };
            myConfig.hero_image_url = "";
            storage.upsert(STORAGE_KEYS.USER_CONFIG, myConfig);
        } catch (err) {
            console.error("Reset failed", err);
        }
    };

    // Mock Data for Charts
    const activityData = [40, 70, 45, 90, 65, 80, 55]; // Mon-Sun

    // Time-based greeting logic
    const hour = new Date().getHours();
    let greetingKey = "good_evening";
    if (hour < 12) greetingKey = "good_morning";
    else if (hour < 18) greetingKey = "good_afternoon";

    // Date formatting based on locale
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const currentDate = new Date().toLocaleDateString(t('dashboard.date_locale'), dateOptions);

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-neutral-200 relative h-56 group bg-neutral-900">
                <img src={headerImage} alt="Workspace" className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-md text-white hover:bg-white/20 transition-colors border border-white/20 text-xs font-bold disabled:opacity-50">
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                    <button onClick={handleResetImage} className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-md text-white hover:bg-white/20 transition-colors border border-white/20 text-xs font-bold">
                        Reset
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>

                <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-0.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-sm">{t('dashboard.system_online')}</span>
                        <span className="text-white/80 text-xs font-medium flex items-center">
                            <Wifi size={10} className="mr-1" />
                            {user ? user.displayName || user.email : t('dashboard.guest')}
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-1">
                        {t(`dashboard.${greetingKey}`)}
                    </h1>
                    <p className="text-neutral-300 text-sm font-medium">{t('dashboard.subtitle')} • {currentDate}</p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[400px]">
                    <TaskWidget />
                </div>
                <div className="lg:col-span-1 h-[400px]">
                    <UpcomingWidget />
                </div>
                <div className="lg:col-span-1 h-[400px]">
                    <DeadlineTimer />
                </div>
            </div>

        </div>
    );
}


