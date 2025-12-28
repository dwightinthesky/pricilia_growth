import React, { useState, useEffect } from 'react';
import { Home, Check, RefreshCw, DollarSign, Droplets, Plus, Loader2, Trash2 } from 'lucide-react';
import { isSameMonth, parseISO } from 'date-fns';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ChoresPage = () => {
    const { currentUser: user, loading: loadingUser } = useAuth();
    const { t } = useTranslation();
    const [chores, setChores] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newType, setNewType] = useState('bill');
    const [newFreq, setNewFreq] = useState('Monthly');

    useEffect(() => {
        if (!user) {
            setChores([]);
            if (!loadingUser) setLoadingData(false);
            return;
        }

        // Initial load
        setChores(storage.get(STORAGE_KEYS.CHORES));
        setLoadingData(false);

        // Subscribe
        const unsubscribe = storage.subscribe(STORAGE_KEYS.CHORES, (data) => {
            setChores(data);
        });
        return () => unsubscribe();
    }, [user, loadingUser]);

    const handleAdd = async () => {
        if (!newTitle.trim()) return;
        storage.add(STORAGE_KEYS.CHORES, {
            userId: user.uid,
            title: newTitle,
            amount: newAmount,
            type: newType,
            frequency: newFreq,
            completed: false,
            createdAt: new Date().toISOString()
        });
        setShowAdd(false);
        setNewTitle('');
        setNewAmount('');
    };

    const toggleComplete = async (id, status) => {
        storage.update(STORAGE_KEYS.CHORES, id, { completed: !status });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete item?")) {
            storage.remove(STORAGE_KEYS.CHORES, id);
        }
    };

    if (loadingUser || loadingData) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-stone-400" /></div>;

    const ChoreCard = ({ item }) => (
        <div className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-xl hover:border-stone-300 transition-all group">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => toggleComplete(item.id, item.completed)}
                    className={`p-1 rounded-full border ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-stone-300 text-transparent hover:border-stone-400'}`}
                >
                    <Check size={14} />
                </button>
                <div>
                    <h3 className={`text-sm font-bold ${item.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">{item.frequency === 'Monthly' ? t('chores.freq_monthly') : t('chores.freq_weekly')}</span>
                        {item.type === 'bill' && item.amount && <span className="font-mono text-stone-700">${item.amount}</span>}
                    </div>
                </div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
            </button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight flex items-center">
                        <Home className="mr-3 text-orange-500" size={32} />
                        {t('chores.title')}
                    </h1>
                    <p className="text-stone-500 text-sm mt-2">{t('chores.subtitle')}</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-neutral-800 transition-colors">
                    <Plus size={16} className="mr-2" /> {t('chores.add_item')}
                </button>
            </div>

            {showAdd && (
                <div className="mb-6 p-4 bg-white border rounded-xl shadow-sm flex flex-wrap gap-2 items-center animate-in slide-in-from-top-2">
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className="border rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-black" />
                    <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Amount" type="number" className="border rounded px-3 py-2 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-black" />
                    <select value={newType} onChange={e => setNewType(e.target.value)} className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black">
                        <option value="bill">{t('chores.type_bill')}</option>
                        <option value="chore">{t('chores.type_chore')}</option>
                    </select>
                    <select value={newFreq} onChange={e => setNewFreq(e.target.value)} className="border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black">
                        <option value="Monthly">{t('chores.freq_monthly')}</option>
                        <option value="Weekly">{t('chores.freq_weekly')}</option>
                    </select>
                    <button onClick={handleAdd} className="bg-orange-500 text-white px-4 py-2 rounded font-bold text-sm hover:bg-orange-600 transition-colors">{t('chores.save')}</button>
                    <button onClick={() => setShowAdd(false)} className="text-stone-400 px-2 hover:text-stone-600 transition-colors">{t('chores.cancel')}</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                        <DollarSign size={16} className="mr-2" /> {t('chores.monthly_bills')}
                    </h2>
                    {chores.filter(c => c.type === 'bill').length === 0 && <p className="text-xs text-stone-300">{t('chores.no_bills')}</p>}
                    {chores.filter(c => c.type === 'bill').map(item => (
                        <ChoreCard key={item.id} item={item} />
                    ))}
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                        <Droplets size={16} className="mr-2" /> {t('chores.household_tasks')}
                    </h2>
                    {chores.filter(c => c.type === 'chore').length === 0 && <p className="text-xs text-stone-300">{t('chores.no_chores')}</p>}
                    {chores.filter(c => c.type === 'chore').map(item => (
                        <ChoreCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChoresPage;
