import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    ListTodo,
    Clock,
    Calendar,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import MeetingCard from '../components/MeetingCard';
import './Dashboard.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard({ tasks, meetings }) {
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const recentTasks = tasks.filter(t => t.status !== 'done').slice(0, 4);
    const recentMeetings = meetings.slice(0, 3);

    return (
        <div className="dashboard">
            <TopBar
                title="Dashboard"
                subtitle={`Welcome back, Divyanshu — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
            />

            <motion.div
                className="dashboard__content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Stats */}
                <motion.div className="dashboard__stats" variants={itemVariants}>
                    <StatCard
                        icon={ListTodo}
                        label="Total Tasks"
                        value={totalTasks}
                        trend="up"
                        trendValue="+3"
                        color="#6366f1"
                        delay={0}
                    />
                    <StatCard
                        icon={Clock}
                        label="In Progress"
                        value={inProgressTasks}
                        trend="up"
                        trendValue="+1"
                        color="#f59e0b"
                        delay={0.1}
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Completed"
                        value={doneTasks}
                        trend="up"
                        trendValue="+2"
                        color="#10b981"
                        delay={0.2}
                    />
                    <StatCard
                        icon={Calendar}
                        label="Meetings"
                        value={meetings.length}
                        trend="down"
                        trendValue="-1"
                        color="#06b6d4"
                        delay={0.3}
                    />
                </motion.div>

                {/* Main Grid */}
                <div className="dashboard__grid">
                    {/* Recent Tasks */}
                    <motion.div className="dashboard__section" variants={itemVariants}>
                        <div className="dashboard__section-header">
                            <h2 className="dashboard__section-title">Recent Tasks</h2>
                            <Link to="/tasks" className="dashboard__section-link">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="dashboard__tasks-list">
                            {recentTasks.map((task, i) => (
                                <TaskCard key={task.id} task={task} index={i} />
                            ))}
                        </div>
                    </motion.div>

                    {/* Activity & Meetings */}
                    <motion.div className="dashboard__sidebar-section" variants={itemVariants}>
                        {/* Quick Stats */}
                        <div className="dashboard__quick-stats card">
                            <h3 className="dashboard__quick-stats-title">
                                <TrendingUp size={16} /> Sprint Progress
                            </h3>
                            <div className="dashboard__progress">
                                <div className="dashboard__progress-header">
                                    <span>{doneTasks} of {totalTasks} tasks</span>
                                    <span>{Math.round((doneTasks / totalTasks) * 100)}%</span>
                                </div>
                                <div className="dashboard__progress-track">
                                    <motion.div
                                        className="dashboard__progress-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    />
                                </div>
                            </div>

                            <div className="dashboard__status-breakdown">
                                {[
                                    { label: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: '#3b82f6' },
                                    { label: 'In Progress', count: inProgressTasks, color: '#f59e0b' },
                                    { label: 'Review', count: tasks.filter(t => t.status === 'review').length, color: '#8b5cf6' },
                                    { label: 'Done', count: doneTasks, color: '#10b981' },
                                ].map(item => (
                                    <div key={item.label} className="dashboard__status-item">
                                        <span className="dashboard__status-dot" style={{ background: item.color }} />
                                        <span className="dashboard__status-label">{item.label}</span>
                                        <span className="dashboard__status-count">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Meetings */}
                        <div className="dashboard__meetings-section">
                            <div className="dashboard__section-header">
                                <h2 className="dashboard__section-title">Recent Meetings</h2>
                                <Link to="/meetings" className="dashboard__section-link">
                                    View all <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="dashboard__meetings-list">
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
