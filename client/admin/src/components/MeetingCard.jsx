import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, ChevronDown, ChevronUp, Video, Phone, MessageSquare } from 'lucide-react';
import { teamMembers } from '../data/mockData';

const typeConfig = {
    sprint: { icon: Users, color: '#6366f1', label: 'Sprint' },
    review: { icon: MessageSquare, color: '#06b6d4', label: 'Review' },
    technical: { icon: Video, color: '#10b981', label: 'Technical' },
    demo: { icon: Phone, color: '#f59e0b', label: 'Demo' },
    'one-on-one': { icon: Users, color: '#8b5cf6', label: '1:1' },
};

export default function MeetingCard({ meeting, index = 0 }) {
    const [expanded, setExpanded] = useState(false);
    const config = typeConfig[meeting.type] || typeConfig.review;
    const TypeIcon = config.icon;
    const attendeesList = meeting.attendees.map(id => teamMembers.find(m => m.id === id)).filter(Boolean);

    return (
        <motion.div
            className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            layout
        >
            <div className="flex p-5 gap-4 md:gap-5 cursor-pointer hover:bg-zinc-800/30 transition-colors group" onClick={() => setExpanded(!expanded)}>
                <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl mt-1 shrink-0 shadow-inner" style={{ background: `${config.color}15`, color: config.color }}>
                    <TypeIcon size={20} />
                </div>

                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight truncate pb-0.5 m-0">{meeting.title}</h3>
                        <span className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md border" style={{ background: `${config.color}15`, color: config.color, borderColor: `${config.color}30` }}>
                            {config.label}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[11px] text-zinc-500 font-semibold tracking-wider uppercase">
                        <span className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/50">
                            <Calendar size={13} className="text-zinc-600" /> {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/50">
                            <Clock size={13} className="text-zinc-600" /> {meeting.time} · {meeting.duration}
                        </span>
                    </div>

                    <div className="flex items-center mt-2 group">
                        <div className="flex items-center -space-x-2">
                            {attendeesList.slice(0, 4).map((member, i) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-900 text-[10px] font-bold text-white shadow-sm transition-transform hover:-translate-y-1 hover:z-10 relative"
                                    style={{ background: member.color, zIndex: 4 - i }}
                                    title={member.name}
                                >
                                    {member.avatar}
                                </div>
                            ))}
                            {attendeesList.length > 4 && (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 text-xs font-semibold text-zinc-400 relative z-0 shadow-inner">
                                    +{attendeesList.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 ml-auto self-start mt-2 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition group-hover:scale-105">
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        className="bg-zinc-950/50 border-t border-zinc-800/60"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="p-5 md:pl-20">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <MessageSquare size={12} /> Meeting Summary
                            </h4>
                            <div className="text-sm text-zinc-300 leading-relaxed space-y-2">
                                {meeting.summary.split('\n').map((line, i) => (
                                    <p key={i} dangerouslySetInnerHTML={{
                                        __html: line
                                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                            .replace(/•/g, '<span class="text-blue-500 mr-2 font-bold opacity-70">•</span>')
                                    }} className="m-0" />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
