import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import TopBar from '../components/TopBar';
import TeamMemberCard from '../components/TeamMemberCard';
import TaskCard from '../components/TaskCard';
import { teamMembers } from '../data/mockData';
import './Team.css';

export default function Team({ tasks }) {
    const [selectedMember, setSelectedMember] = useState(null);

    const getTaskCount = (memberId) =>
        tasks.filter(t => t.assigneeId === memberId && t.status !== 'done').length;

    const getMemberTasks = (memberId) =>
        tasks.filter(t => t.assigneeId === memberId);

    return (
        <div className="team-page">
            <TopBar title="Team" subtitle={`${teamMembers.length} members in your team`} />

            <div className="team-page__content">
                <AnimatePresence mode="wait">
                    {selectedMember ? (
                        <motion.div
                            key="detail"
                            className="team-page__detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                className="team-page__back-btn btn btn-ghost"
                                onClick={() => setSelectedMember(null)}
                            >
                                <ArrowLeft size={16} /> Back to Team
                            </button>

                            <div className="team-page__member-header card">
                                <div className="team-page__member-avatar" style={{ background: selectedMember.color }}>
                                    {selectedMember.avatar}
                                    <span className={`team-page__member-status team-page__member-status--${selectedMember.status}`} />
                                </div>
                                <div className="team-page__member-info">
                                    <h2 className="team-page__member-name">{selectedMember.name}</h2>
                                    <p className="team-page__member-role">{selectedMember.role}</p>
                                    <p className="team-page__member-email">{selectedMember.email}</p>
                                </div>
                                <div className="team-page__member-stats-row">
                                    <div className="team-page__member-stat">
                                        <span className="team-page__member-stat-value">
                                            {getMemberTasks(selectedMember.id).length}
                                        </span>
                                        <span className="team-page__member-stat-label">Total Tasks</span>
                                    </div>
                                    <div className="team-page__member-stat">
                                        <span className="team-page__member-stat-value">
                                            {getMemberTasks(selectedMember.id).filter(t => t.status === 'done').length}
                                        </span>
                                        <span className="team-page__member-stat-label">Completed</span>
                                    </div>
                                    <div className="team-page__member-stat">
                                        <span className="team-page__member-stat-value">
                                            {getMemberTasks(selectedMember.id).filter(t => t.status === 'in-progress').length}
                                        </span>
                                        <span className="team-page__member-stat-label">In Progress</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="team-page__tasks-title">Assigned Tasks</h3>
                            <div className="team-page__tasks-grid">
                                {getMemberTasks(selectedMember.id).map((task, i) => (
                                    <TaskCard key={task.id} task={task} index={i} />
                                ))}
                                {getMemberTasks(selectedMember.id).length === 0 && (
                                    <div className="team-page__no-tasks">
                                        <p>No tasks assigned to {selectedMember.name.split(' ')[0]}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            className="team-page__grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {teamMembers.map((member, i) => (
                                <TeamMemberCard
                                    key={member.id}
                                    member={member}
                                    taskCount={getTaskCount(member.id)}
                                    onClick={() => setSelectedMember(member)}
                                    index={i}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
