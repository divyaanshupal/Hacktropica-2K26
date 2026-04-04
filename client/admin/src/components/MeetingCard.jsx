import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, ChevronDown, ChevronUp, Video, Phone, MessageSquare } from 'lucide-react';
import { teamMembers } from '../data/mockData';
import './MeetingCard.css';

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
            className="meeting-card card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            layout
        >
            <div className="meeting-card__main" onClick={() => setExpanded(!expanded)}>
                <div className="meeting-card__icon" style={{ background: `${config.color}15`, color: config.color }}>
                    <TypeIcon size={20} />
                </div>

                <div className="meeting-card__content">
                    <div className="meeting-card__top-row">
                        <h3 className="meeting-card__title">{meeting.title}</h3>
                        <span className="meeting-card__type-badge" style={{ background: `${config.color}15`, color: config.color }}>
                            {config.label}
                        </span>
                    </div>

                    <div className="meeting-card__meta">
                        <span className="meeting-card__meta-item">
                            <Calendar size={12} /> {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="meeting-card__meta-item">
                            <Clock size={12} /> {meeting.time} · {meeting.duration}
                        </span>
                    </div>

                    <div className="meeting-card__attendees">
                        <div className="meeting-card__avatar-stack">
                            {attendeesList.slice(0, 4).map((member, i) => (
                                <div
                                    key={member.id}
                                    className="meeting-card__avatar"
                                    style={{ background: member.color, zIndex: 4 - i }}
                                    title={member.name}
                                >
                                    {member.avatar}
                                </div>
                            ))}
                            {attendeesList.length > 4 && (
                                <div className="meeting-card__avatar meeting-card__avatar--more">
                                    +{attendeesList.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button className="meeting-card__expand-btn">
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        className="meeting-card__summary"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="meeting-card__summary-content">
                            <h4 className="meeting-card__summary-title">Meeting Summary</h4>
                            <div className="meeting-card__summary-text">
                                {meeting.summary.split('\n').map((line, i) => (
                                    <p key={i} dangerouslySetInnerHTML={{
                                        __html: line
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/•/g, '<span class="meeting-bullet">•</span>')
                                    }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
