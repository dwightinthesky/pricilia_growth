import React from 'react';
import { LogOut, User, Globe, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
    const { currentUser, logout } = useAuth();
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/'; // Force redirect
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-stone-900 mb-8">Settings</h1>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">

                {/* Account Section */}
                <div className="p-6">
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Account</h2>
                    <div className="flex items-center gap-4">
                        {currentUser?.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="w-16 h-16 rounded-full border" />
                        ) : (
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                                <User size={32} />
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-lg text-stone-900">{currentUser?.displayName || 'User'}</p>
                            <p className="text-stone-500">{currentUser?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="p-6">
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Preferences</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-stone-100 rounded-lg"><Globe size={20} className="text-stone-600" /></div>
                                <span className="font-medium text-stone-700">Language</span>
                            </div>
                            <button
                                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'zh-TW' : 'en')}
                                className="px-3 py-1.5 border rounded-lg text-sm hover:bg-stone-50"
                            >
                                {i18n.language === 'en' ? 'English' : '繁體中文'}
                            </button>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-stone-100 rounded-lg"><Moon size={20} className="text-stone-600" /></div>
                                <span className="font-medium text-stone-700">Dark Mode</span>
                            </div>
                            <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded">Coming Soon</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-red-50/30">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-red-600 font-bold py-3 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>
            </div>

            <p className="text-center text-stone-400 text-xs mt-8">
                Pricilia Life OS v3.0.0
            </p>
        </div>
    );
};

export default SettingsPage;
