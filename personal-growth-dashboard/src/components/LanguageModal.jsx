import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 引入 hook

const regions = [
    { country: 'United Kingdom', lang: 'English', flag: '🇬🇧', code: 'en' },
    { country: 'USA', lang: 'English', flag: '🇺🇸', code: 'en' },
    { country: 'Taiwan', lang: 'Traditional Chinese', flag: '🇹🇼', code: 'zh-TW' },
    { country: 'France', lang: 'Français', flag: '🇫🇷', code: 'fr' }, // 若無 fr 翻譯檔會 fallback 到 en

    /* 🔥 修改：Ireland -> Hungary */
    { country: 'Hungary', lang: 'Magyar', flag: '🇭🇺', code: 'hu' },

    { country: 'Germany', lang: 'Deutsch', flag: '🇩🇪', code: 'de' },
    { country: 'Spain', lang: 'Español', flag: '🇪🇸', code: 'es' },
    { country: 'Canada', lang: 'English', flag: '🇨🇦', code: 'en' },
    { country: 'Netherlands', lang: 'Nederlands', flag: '🇳🇱', code: 'nl' },
];

const LanguageModal = ({ isOpen, onClose }) => {
    const { i18n } = useTranslation(); // 取得 i18n 實例

    if (!isOpen) return null;

    const handleLanguageChange = (code) => {
        i18n.changeLanguage(code); // 🔥 切換語言核心指令
        onClose(); // 關閉視窗
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-500">
                    <X size={24} />
                </button>

                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">Choose your region</h2>
                    <p className="text-stone-500 text-lg">Select a language to update the interface.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regions.map((item) => (
                        <button
                            key={item.country}
                            onClick={() => handleLanguageChange(item.code)} // 🔥 綁定切換事件
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-stone-50 transition-all text-left group border border-transparent hover:border-stone-100"
                        >
                            <span className="text-4xl shadow-sm rounded-full overflow-hidden w-12 h-12 flex items-center justify-center bg-stone-50">
                                {item.flag}
                            </span>
                            <div>
                                <div className="font-bold text-stone-900 text-lg group-hover:text-black">{item.country}</div>
                                <div className="text-stone-500">{item.lang}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageModal;
