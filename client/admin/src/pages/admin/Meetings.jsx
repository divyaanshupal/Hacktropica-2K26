import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, FileText, ChevronDown, Loader2 } from 'lucide-react';
import TopBar from '../../components/TopBar';
import { meetings } from '../../data/mockData';
import { fetchEmployees, mapEmployeeData } from '../../services/api';

export default function Meetings() {
    const [expandedId, setExpandedId] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await fetchEmployees();
                setEmployees(data.map(mapEmployeeData));
            } catch (error) {
                console.error("Failed to fetch employees for meetings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadEmployees();
    }, []);

    const getMeetingAttendees = (attendeeIds) => {
        return attendeeIds.map(id => 
            employees.find(m => m.id === id || m.employeeId === id)
        ).filter(Boolean);
    };

    const getMeetingTypeColor = (type) => {
        const colors = { sprint: '#6366f1', review: '#8b5cf6', technical: '#f59e0b', demo: '#10b981', 'one-on-one': '#06b6d4' };
        return colors[type] || '#64748b';
    };

    const getMeetingTypeLabel = (type) => {
        const labels = { sprint: 'Sprint Planning', review: 'Review', technical: 'Technical', demo: 'Demo', 'one-on-one': '1:1' };
        return labels[type] || type;
    };

    return (
        <div className="w-full flex-col">
            <TopBar title="Meetings" subtitle={`${meetings.length} meetings scheduled`} />

            <div className="flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-4">
                        <Loader2 size={40} className="animate-spin text-blue-500" />
                        <p className="text-sm font-bold uppercase tracking-widest">Resolving Team Sync...</p>
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl">
                        <Calendar size={48} className="opacity-20" />
                        <h3 className="text-xl font-bold text-zinc-300">No meetings scheduled</h3>
                        <p className="text-sm">Schedule your first meeting to get started</p>
                    </div>
                ) : (
                    <motion.div
                        className="flex flex-col gap-4 max-w-4xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {meetings.map((meeting, index) => (
                            <motion.div
                                key={meeting.id}
                                className={`flex flex-col border rounded-2xl overflow-hidden shadow-sm transition-all bg-zinc-900 ${expandedId === meeting.id ? 'border-zinc-700' : 'border-zinc-800 hover:border-zinc-700'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <div
                                    className="flex items-center p-5 gap-6 cursor-pointer select-none relative group"
                                    onClick={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
                                >
                                    <div className="hidden sm:flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest min-w-[120px]" style={{ background: `${getMeetingTypeColor(meeting.type)}20`, color: getMeetingTypeColor(meeting.type), border: `1px solid ${getMeetingTypeColor(meeting.type)}40` }}>
                                        {getMeetingTypeLabel(meeting.type)}
                                    </div>

                                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white m-0 tracking-tight">{meeting.title}</h3>
                                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                                            <span className="flex items-center gap-2">
                                                <Calendar size={14} className="text-zinc-500" />
                                                {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Clock size={14} className="text-zinc-500" />
                                                {meeting.time}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Clock size={14} className="text-zinc-500" />
                                                {meeting.duration}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`p-2 rounded-full bg-zinc-800 text-zinc-400 transition-transform ${expandedId === meeting.id ? 'rotate-180 bg-zinc-700 text-white' : 'group-hover:bg-zinc-700 group-hover:text-white'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === meeting.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-t border-zinc-800 bg-zinc-950/50"
                                        >
                                            <div className="p-6 flex flex-col gap-8">
                                                {/* Attendees */}
                                                <div className="flex flex-col gap-4">
                                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                        <Users size={14} /> Attendees
                                                    </h4>
                                                    <div className="flex flex-wrap gap-3">
                                                        {getMeetingAttendees(meeting.attendees).map(attendee => (
                                                            <div key={attendee.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 pr-4 rounded-full overflow-hidden shadow-sm">
                                                                <div 
                                                                    className="w-10 h-10 flex items-center justify-center text-white font-bold text-xs"
                                                                    style={{ background: attendee.color }}
                                                                >
                                                                    {attendee.avatar}
                                                                </div>
                                                                <div className="flex flex-col justify-center">
                                                                    <span className="text-sm font-semibold text-white leading-tight">{attendee.name}</span>
                                                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-tight mt-0.5">{attendee.role}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {getMeetingAttendees(meeting.attendees).length === 0 && (
                                                            <span className="text-xs text-zinc-600 italic">No matching team members found in database</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Meeting Summary */}
                                                <div className="flex flex-col gap-4">
                                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                                        <FileText size={14} /> Meeting Summary
                                                    </h4>
                                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-sm text-zinc-300 leading-relaxed font-mono">
                                                        {meeting.summary.split('\n').map((line, i) => {
                                                            if (!line.trim()) return <div key={i} className="h-4" />;
                                                            if (line.startsWith('•')) {
                                                                return (
                                                                    <div key={i} className="flex pl-4 relative my-1 text-zinc-400">
                                                                        <span className="text-blue-500 absolute left-0 font-bold">•</span>
                                                                        {line.replace('• ', '')}
                                                                    </div>
                                                                );
                                                            }
                                                            if (line.startsWith('**') && line.endsWith('**')) {
                                                                return (
                                                                    <div key={i} className="font-bold text-white mt-4 border-b border-zinc-800 pb-2 mb-2 tracking-tight">
                                                                        {line.replace(/\*\*/g, '')}
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div key={i} className="my-1">
                                                                    {line}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
