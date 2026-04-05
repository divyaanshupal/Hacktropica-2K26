import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ListTodo, Clock, Calendar, ArrowRight, TrendingUp, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import TaskCard from '../../components/TaskCard';
import MeetingCard from '../../components/MeetingCard';
import { fetchEmployees, mapEmployeeData } from '../../services/api';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard({ tasks, meetings, employees }) {
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const recentTasks = tasks.filter(t => t.status !== 'done').slice(0, 4);
    const recentMeetings = meetings.slice(0, 3);

    const onlineAgents = employees.filter(m => m.status === 'online').length;

    return (
        <div className="w-full flex flex-col">
            <TopBar
                title="Dashboard"
                subtitle={`Welcome back, Divyanshu — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
            />

            <motion.div
                className="flex flex-col gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Stats */}
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6" variants={itemVariants}>
                    <StatCard icon={ListTodo} label="Total Tasks" value={totalTasks} trend="up" trendValue="+3" color="#3b82f6" delay={0} />
                    <StatCard icon={Clock} label="In Progress" value={inProgressTasks} trend="up" trendValue="+1" color="#f59e0b" delay={0.1} />
                    <StatCard icon={CheckCircle2} label="Completed" value={doneTasks} trend="up" trendValue="+2" color="#10b981" delay={0.2} />
                    <StatCard icon={Calendar} label="Meetings" value={meetings.length} trend="down" trendValue="-1" color="#06b6d4" delay={0.3} />
                    
                    <StatCard icon={Users} label="Agents Online" value={`${onlineAgents}/${employees.length}`} trend="up" trendValue="Sync" color="#8b5cf6" delay={0.4} />
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 items-start">
                    {/* Recent Tasks */}
                    <motion.div className="flex flex-col gap-6" variants={itemVariants}>
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-xl font-bold tracking-tight text-white mb-0">Recent Tasks</h2>
                            <Link to="/tasks" className="text-sm text-blue-500 flex items-center gap-1 hover:text-blue-400 font-medium transition">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="flex flex-col gap-4">
                            {recentTasks.map((task, i) => (
                                <TaskCard key={task.id} task={task} index={i} employees={employees} />
                            ))}
                        </div>
                    </motion.div>

                    {/* Activity & Meetings */}
                    <motion.div className="flex flex-col gap-8" variants={itemVariants}>
                        {/* Quick Stats */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                            <h3 className="text-[11px] font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest border-b border-zinc-800/60 pb-3">
                                <TrendingUp size={14} className="text-blue-500" /> Sprint Progress
                            </h3>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <span>{doneTasks} of {totalTasks} tasks</span>
                                    <span>{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</span>
                                </div>
                                <div className="h-2.5 bg-zinc-950 border border-zinc-800/50 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full relative"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
                                        transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-sm mix-blend-overlay"></div>
                                    </motion.div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {[
                                    { label: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: '#3b82f6' },
                                    { label: 'In Progress', count: inProgressTasks, color: '#f59e0b' },
                                    { label: 'Review', count: tasks.filter(t => t.status === 'review').length, color: '#8b5cf6' },
                                    { label: 'Done', count: doneTasks, color: '#10b981' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-3 bg-zinc-950/50 py-2 px-3 rounded-xl border border-zinc-800/30">
                                        <span className="w-2 h-2 rounded-full shadow-md" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}60` }} />
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{item.label}</span>
                                          <span className="text-sm font-bold text-white leading-tight">{item.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Meetings */}
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center px-1">
                                <h2 className="text-xl font-bold tracking-tight text-white mb-0">Recent Meetings</h2>
                                <Link to="/meetings" className="text-sm text-blue-500 flex items-center gap-1 hover:text-blue-400 font-medium transition">
                                    View all <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                {recentMeetings.map((meeting, i) => (
                                    <MeetingCard key={meeting.id} meeting={meeting} index={i} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
