import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { teamMembers } from '../data/mockData';

const priorityConfig = {
    high: { label: 'High', style: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    medium: { label: 'Medium', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    low: { label: 'Low', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

const statusConfig = {
    'todo': { label: 'To Do', style: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    'in-progress': { label: 'In Progress', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    'review': { label: 'In Review', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'done': { label: 'Done', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

export default function TaskCard({ task, index = 0 }) {
    const assignee = teamMembers.find(m => m.id === task.assigneeId);
    const priority = priorityConfig[task.priority];
    const status = statusConfig[task.status];
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today && task.status !== 'done';
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    return (
        <motion.div
            className="flex flex-col gap-4 p-5 md:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer shadow-sm hover:border-zinc-700 hover:shadow-md transition-all relative overflow-hidden group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            layout
        >
            <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500" />
            <div className="flex justify-between items-start gap-4">
                <div className="flex gap-2">
                    <span className={`inline-flex py-0.5 px-2.5 rounded-md text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-widest ${priority.style}`}>
                        <AlertCircle size={10} strokeWidth={3} />
                        {priority.label}
                    </span>
                    <span className={`inline-flex py-0.5 px-2.5 rounded-md text-[10px] font-bold border uppercase tracking-widest ${status.style}`}>{status.label}</span>
                </div>
            </div>

            <h3 className="text-base md:text-lg font-bold text-white tracking-tight m-0 leading-tight">{task.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed m-0 flex-1 line-clamp-2">{task.description}</p>

            <div className="flex flex-wrap gap-2 pt-2">
                {task.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold text-zinc-500 bg-zinc-800/50 py-1 px-2 rounded-md border border-zinc-700/50">#{tag}</span>
                ))}
            </div>

            <div className="flex mt-2 pt-4 border-t border-zinc-800/80 justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    {assignee && (
                        <>
                            <div className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold text-white shadow-inner border border-zinc-700/50" style={{ background: assignee.color }}>
                                {assignee.avatar}
                            </div>
                            <span className="text-xs font-semibold text-zinc-300">{assignee.name.split(' ')[0]}</span>
                        </>
                    )}
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md ${isOverdue ? 'bg-rose-500/10 text-rose-500' : 'text-zinc-500 bg-zinc-800/50 border border-zinc-700/30'}`}>
                    <Clock size={12} strokeWidth={2.5} />
                    <span>
                        {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : daysUntilDue === 0 ? 'Due today' : `${daysUntilDue}d left`}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
