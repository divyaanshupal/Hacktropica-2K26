import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, trend, trendValue, color, delay = 0 }) {
    const isPositive = trend === 'up';

    return (
        <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <div className="stat-card__icon" style={{ background: `${color}15`, color }}>
                <Icon size={22} />
            </div>
            <div className="stat-card__content">
                <span className="stat-card__label">{label}</span>
                <div className="stat-card__value-row">
                    <motion.span
                        className="stat-card__value"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: delay + 0.2 }}
                    >
                        {value}
                    </motion.span>
                    {trendValue && (
                        <span className={`stat-card__trend ${isPositive ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {trendValue}
                        </span>
                    )}
                </div>
            </div>
            <div className="stat-card__glow" style={{ background: color }} />
        </motion.div>
    );
}
