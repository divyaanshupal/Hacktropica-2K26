import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Bug, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import TeamMemberCard from '../../components/TeamMemberCard';
import { fetchEmployees, mapEmployeeData } from '../../services/api';

export default function Team({ tasks, setTasks, employees }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [logs, setLogs] = useState([
        { id: Date.now(), time: new Date().toLocaleTimeString(), text: "System initialized. Agents active.", type: "info" }
    ]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeAgentsCount = employees.filter(m => m.status === 'online').length;
    const hasSev1 = tasks.some(t => t.criticality >= 9 && t.status !== 'done');
    const systemStatus = hasSev1 ? 'CRITICAL' : 'NOMINAL';

    const triggerChaos = (type) => {
        if (employees.length === 0) return;

        let sector, title, criticality, logMsg, logType;
        if (type === 'sev1') {
            sector = 'DevOps';
            title = 'AWS Us-East-1 Outage';
            criticality = 10;
            logType = 'danger';
        } else if (type === 'security') {
            sector = 'Security';
            title = 'SQL Injection Attempt Identified';
            criticality = 9;
            logType = 'warning';
        } else {
            sector = 'SDE';
            title = 'Checkout Button Unresponsive';
            criticality = 8;
            logType = 'info';
        }

        // Logic to match sector
        const eligibleMembers = employees.filter(m => m.role.toLowerCase().includes(sector.toLowerCase()) || m.role === sector);
        const assignedMember = eligibleMembers.length ? eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)] : employees[0];

        logMsg = `Diana randomly assigned ${title} to ${assignedMember.name}. Reason: Sector match (${sector}) prioritized.`;

        const newTask = {
            id: Date.now(),
            title,
            status: 'todo',
            assigneeId: assignedMember.id,
            criticality,
            priority: 'high'
        };

        setTasks(prev => [newTask, ...prev]);
        setLogs(prev => [{ id: Date.now() + 1, time: new Date().toLocaleTimeString(), text: logMsg, type: logType }, ...prev]);
    };

    return (
        <div className="flex flex-col w-full h-full flex-1">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-zinc-800/80 bg-zinc-950 gap-4 shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-white m-0 flex items-center gap-3">
                        Mission Control <span className="text-[10px] font-mono tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">LIVE</span>
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

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
                <aside className="w-full lg:w-1/4 xl:w-[320px] shrink-0 border-r border-zinc-800/80 bg-zinc-950 flex flex-col">
                    <div className="p-5 border-b border-zinc-800/80">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Swarm Activity Feed</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        <AnimatePresence>
                            {logs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    className={`flex flex-col gap-1 p-3 rounded-xl border text-xs font-medium leading-relaxed ${log.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-200' : log.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : log.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                >
                                    <span className={`text-[10px] font-mono font-bold ${log.type === 'danger' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-zinc-500'}`}>[{log.time}]</span>
                                    <span>{log.text}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950/50">
                    {employees.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4 bg-zinc-900/20 border border-zinc-900 rounded-3xl">
                            <Activity size={48} className="opacity-10" />
                            <p className="text-sm font-medium">No agents found in the MongoDB cluster.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {employees.map((member) => (
                                <TeamMemberCard
                                    key={member.id}
                                    member={member}
                                    sector={member.role}
                                    tasks={tasks.filter(t => (t.assigneeId === member.id || t.assigneeId === member.employeeId) && t.status !== 'done')}
                                />
                            ))}
                        </div>
                    )}
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
