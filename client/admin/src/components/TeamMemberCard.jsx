import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ListTodo } from 'lucide-react';

export default function TeamMemberCard({ member, sector, tasks, onClick }) {
    const sortedTasks = [...tasks].sort((a, b) => (b.criticality || 0) - (a.criticality || 0));
    const activeTask = sortedTasks[0];
    const queuedTasks = sortedTasks.slice(1);

    const workloadScore = sortedTasks.reduce((sum, t) => sum + (t.criticality || 4), 0);
    const isCritical = activeTask && activeTask.criticality >= 8;

    return (
        <motion.div
            className={`flex flex-col p-6 bg-zinc-900 border rounded-2xl relative overflow-hidden transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] group ${isCritical ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.08)]' : 'border-zinc-800'}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`} />
            
            <div className="flex justify-between items-center pb-5 border-b border-zinc-800/60 mb-5">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold text-white shadow-inner border border-zinc-700/50" style={{ background: member.color }}>{member.avatar}</div>
                        <span 
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 shadow-sm ${member.status === 'online' ? 'bg-emerald-500' : member.status === 'busy' ? 'bg-amber-500' : 'bg-red-500'}`} 
                            title={member.status} 
                        />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight m-0">{member.name}</h3>
                        <span className="inline-flex py-0.5 px-2.5 mt-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-800/50 border border-zinc-700/50">{sector}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 flex-1">
                <div className="flex flex-col gap-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        LIVE STATE <Activity size={12} className={isCritical ? "text-red-500 animate-pulse" : "text-blue-500"} />
                    </h4>
                    {activeTask ? (
                        <div className={`p-4 rounded-xl flex flex-col gap-2 ${isCritical ? 'bg-red-500/10 border border-red-500/20' : 'bg-zinc-950 border border-zinc-800/50'}`}>
                            <span className={`text-sm font-semibold leading-relaxed ${isCritical ? 'text-red-100' : 'text-white'}`}>{activeTask.title}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTask.criticality >= 8 ? 'text-red-500' : 'text-blue-500'}`}>
                                CRIT: {activeTask.criticality}
                            </span>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl flex items-center justify-center text-sm font-medium text-zinc-500 bg-zinc-950/50 border border-dashed border-zinc-800">
                            Idle / Monitoring
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        SMART QUEUE <ListTodo size={12} className="text-zinc-600"/>
                    </h4>
                    <div className="flex flex-col gap-2">
                        {queuedTasks.length > 0 ? queuedTasks.map(t => (
                            <div key={t.id} className="flex justify-between items-center py-2 px-3 rounded-lg bg-zinc-800/30 text-xs">
                                <span className="font-medium text-zinc-300 truncate mr-2">{t.title}</span>
                                <span className="text-[10px] font-bold text-zinc-500 shrink-0">C:{t.criticality || 4}</span>
                            </div>
                        )) : (
                            <div className="text-xs text-zinc-500 italic py-2">Queue clear</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-5 mt-5 border-t border-zinc-800/60">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-white">{tasks.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pending Tasks</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-white">{workloadScore}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Workload Score</span>
                </div>
            </div>
        </motion.div>
    );
}
