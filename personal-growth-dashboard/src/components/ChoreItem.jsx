import React, { useState } from 'react';
import { Check, Trash2, Clock, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChoreItem = ({ id, title, time, tag, initialCompleted, onDelete }) => {
    const [isCompleted, setIsCompleted] = useState(initialCompleted);

    const toggleComplete = () => {
        setIsCompleted(!isCompleted);
        // TODO: Add Haptic/Sound trigger here
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`
            group flex items-center justify-between p-4 mb-3 rounded-xl border transition-all duration-300
            ${isCompleted
                    ? 'bg-[#1a1a1a]/40 border-white/5 opacity-50'
                    : 'bg-[#1E1E1E] border-white/5 hover:border-[#f4f46a]/50 hover:shadow-[0_4px_20px_-5px_rgba(244,244,106,0.1)]'
                }
        `}
        >
            {/* Left & Content */}
            <div className="flex items-center gap-4 flex-1 cursor-pointer select-none" onClick={toggleComplete}>

                {/* Animated Checkbox */}
                <div className={`
          relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300
          ${isCompleted
                        ? 'bg-[#f4f46a] border-[#f4f46a] scale-110'
                        : 'border-neutral-500 group-hover:border-[#f4f46a]'
                    }
        `}>
                    <Check
                        size={14}
                        className={`text-black transition-transform duration-300 ${isCompleted ? 'scale-100' : 'scale-0'}`}
                        strokeWidth={3}
                    />
                </div>

                {/* Text Content */}
                <div className="flex flex-col">
                    <span className={`text-sm font-medium transition-all duration-300 relative ${isCompleted ? 'text-neutral-500' : 'text-neutral-100'}`}>
                        {title}
                        {/* Animated Strikethrough line */}
                        <span className={`absolute left-0 top-1/2 w-full h-px bg-[#f4f46a]/50 transition-all duration-500 origin-left ${isCompleted ? 'scale-x-100' : 'scale-x-0'}`}></span>
                    </span>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-500">
                        {time && (
                            <div className="flex items-center gap-1">
                                <Clock size={10} />
                                <span>{time}</span>
                            </div>
                        )}
                        {tag && (
                            <div className="flex items-center gap-1 font-bold text-[#f4f46a]">
                                <Tag size={10} />
                                <span>{tag}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action: Delete (Hover only) */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all transform hover:scale-110"
            >
                <Trash2 size={16} />
            </button>
        </motion.div>
    );
};

export default ChoreItem;
