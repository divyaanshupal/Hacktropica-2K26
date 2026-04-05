import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, trend, trendValue, color, delay = 0 }) {
    const isPositive = trend === 'up';

    return (
        <motion.div
            className="relative flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <div className="flex z-10 w-full items-center gap-4">
                <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 shadow-inner" style={{ background: `${color}15`, color }}>
                    <Icon size={24} />
                </div>
                <div className="flex flex-col flex-1">
                    <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-1">{label}</span>
                    <div className="flex items-center gap-3">
                        <motion.span
                            className="text-[28px] font-bold text-white tracking-tight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: delay + 0.2 }}
                        >
                            {value}
                        </motion.span>
                        {trendValue && (
                            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {trendValue}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {/* Subtle glow effect behind the card content */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none" style={{ background: color }} />
        </motion.div>
    );
}
