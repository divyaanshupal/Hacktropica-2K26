import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Bug, Shield, AlertTriangle, CheckCircle, Loader2, ArrowLeft, CheckSquare, Layers, Clock, AlertCircle } from 'lucide-react';
import TeamMemberCard from '../../components/TeamMemberCard';
import { fetchEmployees, mapEmployeeData } from '../../services/api';

const TableHeader = ({ icon: Icon, title, count }) => (
    <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <Icon size={16} className="text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">{title}</h3>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">{count} Tasks</span>
    </div>
);

const TaskTable = ({ tasks }) => {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl gap-3 text-zinc-600">
                <CheckCircle size={24} className="opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest">No Records Found</span>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80">
                        <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Task Title</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Priority</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Status</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Deadline</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {tasks.map(task => (
                        <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors group">
                            <td className="px-4 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{task.title}</span>
                                    <span className="text-[10px] text-zinc-500 line-clamp-1">{task.description}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter border ${
                                    task.priority === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                }`}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{task.status}</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <span className="text-xs font-mono text-zinc-500">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default function Team({ tasks, setTasks, employees }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedMemberId, setSelectedMemberId] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const selectedMember = employees.find(e => e.id === selectedMemberId);
    const memberTasks = tasks.filter(t => t.assigneeId === selectedMemberId || t.assigneeId === selectedMember?.employeeId);
    const ongoingTasks = memberTasks.filter(t => t.status !== 'done');
    const finishedTasks = memberTasks.filter(t => t.status === 'done');

    const activeAgentsCount = employees.filter(m => m.status === 'online').length;
    const hasSev1 = tasks.some(t => t.criticality >= 9 && t.status !== 'done');
    const systemStatus = hasSev1 ? 'CRITICAL' : 'NOMINAL';

    const triggerChaos = (type) => {
        if (employees.length === 0) return;

        let sector, title, criticality;
        if (type === 'sev1') {
            sector = 'DevOps';
            title = 'AWS Us-East-1 Outage';
            criticality = 10;
        } else if (type === 'security') {
            sector = 'Security';
            title = 'SQL Injection Attempt Identified';
            criticality = 9;
        } else {
            sector = 'SDE';
            title = 'Checkout Button Unresponsive';
            criticality = 8;
        }

        const eligibleMembers = employees.filter(m => m.role.toLowerCase().includes(sector.toLowerCase()) || m.role === sector);
        const assignedMember = eligibleMembers.length ? eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)] : employees[0];

        const newTask = {
            id: Date.now(),
            title,
            status: 'todo',
            assigneeId: assignedMember.id,
            criticality,
            priority: criticality >= 9 ? 'critical' : (criticality >= 7 ? 'high' : (criticality >= 4 ? 'medium' : 'low')),
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString()
        };

        setTasks(prev => [newTask, ...prev]);
    };

    return (
        <div className="flex flex-col w-full h-full flex-1">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-zinc-800/80 bg-zinc-950 gap-4 shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-white m-0 flex items-center gap-3">
                        Team <span className="text-[10px] font-mono tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">LIVE</span>
                    </h1>
                    <div className="text-xs font-mono text-zinc-500 mt-2">{currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}</div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border ${systemStatus === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {systemStatus === 'CRITICAL' ? <AlertTriangle size={14} className="animate-pulse" /> : <CheckCircle size={14} />}
                        <span>System {systemStatus}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
                        <Activity size={14} className="text-blue-500" />
                        <span>{activeAgentsCount} Agents Online</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950/50">
                    <AnimatePresence mode="wait">
                        {selectedMemberId ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col gap-8"
                            >
                                <div className="flex items-center justify-between">
                                    <button 
                                        onClick={() => setSelectedMemberId(null)}
                                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                                    >
                                        <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl group-hover:bg-zinc-800">
                                            <ArrowLeft size={16} />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest">Back to Fleet</span>
                                    </button>

                                    <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl pr-6">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold text-white shadow-inner border border-zinc-700/50" style={{ background: selectedMember.color }}>
                                            {selectedMember.avatar}
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className="text-base font-bold text-white m-0 leading-tight">{selectedMember.name}</h2>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{selectedMember.role}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <section className="flex flex-col">
                                        <TableHeader icon={Clock} title="Ongoing Tasks" count={ongoingTasks.length} />
                                        <TaskTable tasks={ongoingTasks} />
                                    </section>

                                    <section className="flex flex-col">
                                        <TableHeader icon={CheckSquare} title="Mission History" count={finishedTasks.length} />
                                        <TaskTable tasks={finishedTasks} />
                                    </section>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                            >
                                {employees.length === 0 ? (
                                    <div className="col-span-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4 bg-zinc-900/20 border border-zinc-900 rounded-3xl py-24">
                                        <Activity size={48} className="opacity-10" />
                                        <p className="text-sm font-medium">No agents found in the MongoDB cluster.</p>
                                    </div>
                                ) : (
                                    employees.map((member) => (
                                        <TeamMemberCard
                                            key={member.id}
                                            member={member}
                                            sector={member.role}
                                            tasks={tasks.filter(t => (t.assigneeId === member.id || t.assigneeId === member.employeeId) && t.status !== 'done')}
                                            onClick={() => setSelectedMemberId(member.id)}
                                        />
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex flex-col gap-4 shrink-0 z-10 relative">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">Trigger Chaos (Simulations)</h3>
                <div className="flex flex-wrap gap-4">
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-lg text-sm font-semibold transition disabled:opacity-50" 
                        onClick={() => triggerChaos('sev1')}
                        disabled={employees.length === 0}
                    >
                        <ShieldAlert size={16} /> Sev-1 Outage (DevOps)
                    </button>
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-lg text-sm font-semibold transition disabled:opacity-50" 
                        onClick={() => triggerChaos('security')}
                        disabled={employees.length === 0}
                    >
                        <Shield size={16} /> Security Breach (Security)
                    </button>
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-500 rounded-lg text-sm font-semibold transition disabled:opacity-50" 
                        onClick={() => triggerChaos('bug')}
                        disabled={employees.length === 0}
                    >
                        <Bug size={16} /> Base UI Bug (SDE)
                    </button>
                </div>
            </div>
        </div>
    );
}
