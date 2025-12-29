import React, { useState } from 'react';
import { storage, STORAGE_KEYS } from "../../utils/storage";

export default function FinanceAddTransaction() {
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !title) return;

        storage.add(STORAGE_KEYS.FINANCE_TXS, {
            id: Date.now().toString(),
            type: 'expense', // Default to expense for MVP quick add
            title,
            amount: Number(amount),
            currency: 'EUR',
            category: 'general',
            date: new Date().toISOString()
        });

        setAmount('');
        setTitle('');
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow">
            <h3 className="font-bold mb-4">Add Transaction</h3>
            <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    className="border p-2 rounded flex-1"
                    placeholder="Title (e.g. Coffee)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <input
                    type="number"
                    className="border p-2 rounded w-32"
                    placeholder="€0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
                <button className="bg-black text-white px-4 rounded font-bold">Add</button>
            </form>
        </div>
    );
}
