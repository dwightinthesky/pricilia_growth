import React, { useState } from 'react';
import { Bot, X, ArrowRight, Calendar, CheckCircle2, Sparkles, Loader2, DollarSign } from 'lucide-react';
import { askHowie } from '../utils/howieAI';
import { executeHowieAction } from '../utils/actionExecutor'; // 🔥 引入執行器
import { useAuth } from '../context/AuthContext';

const HowieModal = ({ isOpen, onClose }) => { // 注意：onAddData 不需要了
    const { currentUser: user } = useAuth();
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);

    if (!isOpen) return null;

    // 1. 分析 (保持不變)
    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setResult(null);

        try {
            const aiData = await askHowie(input);
            setResult(aiData);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // 2. 確認並執行 (🔥 核心修改)
    const handleConfirm = async () => {
        if (!user) {
            alert("請先登入才能使用 AI 助理儲存功能！");
            return;
        }

        if (result) {
            setIsProcessing(true); // 顯示轉圈圈
            try {
                // 直接呼叫後端寫入資料庫
                const message = await executeHowieAction(result, user.uid);
                alert(message); // 成功提示
                handleClose();  // 關閉視窗
            } catch (error) {
                console.error("Save Error:", error);
                alert("儲存失敗：" + error.message);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleClose = () => {
        setInput('');
        setResult(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200">

                {/* Header */}
                <div className="bg-black p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wide">Howie AI</h2>
                            <p className="text-xs text-stone-400">Pricilia Life OS</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {!result ? (
                        // 輸入模式
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-stone-600">告訴我你想做什麼？</p>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="例如：明天早上 10 點要開會，記得準備簡報 (Task)..."
                                className="w-full h-32 bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-800 focus:outline-none focus:ring-2 focus:ring-black resize-none text-sm placeholder:text-stone-400"
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={isProcessing || !input.trim()}
                                className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                {isProcessing ? "Analyze" : "Analyze Intent"}
                            </button>
                        </div>
                    ) : (
                        // 預覽確認模式
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">Preview Action</p>
                                <button onClick={() => setResult(null)} className="text-xs text-stone-400 hover:text-black">Edit</button>
                            </div>

                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3 relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${result.type === 'schedule' ? 'bg-blue-500' :
                                    result.type === 'finance' ? 'bg-green-500' : 'bg-orange-500'
                                    }`}></div>

                                <div className="pl-3">
                                    <h3 className="font-bold text-xl text-stone-900">{result.title}</h3>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-white border px-2 py-1 rounded text-stone-500 capitalize">{result.type}</span>
                                        {result.priority && <span className="text-xs bg-white border px-2 py-1 rounded text-red-500 font-bold">{result.priority}</span>}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={isProcessing}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200/50 disabled:opacity-70"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                                {isProcessing ? "Syncing..." : "Confirm & Save to Cloud"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HowieModal;
