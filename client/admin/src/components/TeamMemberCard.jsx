import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Briefcase, ChevronRight } from 'lucide-react';
import './TeamMemberCard.css';

export default function TeamMemberCard({ member, taskCount, onClick, index = 0 }) {
    return (
        <motion.div
            className="team-member-card card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={onClick}
        >
            <div className="team-member-card__header">
                <div className="team-member-card__avatar" style={{ background: member.color }}>
                    {member.avatar}
                    <span className={`team-member-card__status team-member-card__status--${member.status}`} />
                </div>
                <ChevronRight size={16} className="team-member-card__chevron" />
            </div>

            <div className="team-member-card__info">
                <h3 className="team-member-card__name">{member.name}</h3>
                <p className="team-member-card__role">
                    <Briefcase size={12} /> {member.role}
                </p>
                <p className="team-member-card__email">
                    <Mail size={12} /> {member.email}
                </p>
            </div>

            <div className="team-member-card__stats">
                <div className="team-member-card__workload">
                    <span className="team-member-card__workload-label">Active Tasks</span>
                    <span className="team-member-card__workload-value">{taskCount}</span>
                </div>
                <div className="team-member-card__bar-track">
                    <motion.div
                        className="team-member-card__bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((taskCount / 5) * 100, 100)}%` }}
                        transition={{ duration: 0.6, delay: index * 0.06 + 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{
                            background: taskCount >= 4
                                ? 'var(--color-danger)'
                                : taskCount >= 2
                                    ? 'var(--color-warning)'
                                    : 'var(--color-success)',
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
