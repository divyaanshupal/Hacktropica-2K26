import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Users, Clock, FileText, ChevronDown } from 'lucide-react';
import TopBar from '../components/TopBar';
import { meetings, teamMembers } from '../data/mockData';
import './Meetings.css';

export default function Meetings() {
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const getMeetingAttendees = (attendeeIds) => {
        return attendeeIds.map(id => teamMembers.find(m => m.id === id)).filter(Boolean);
    };

    const getMeetingTypeColor = (type) => {
        const colors = {
            sprint: '#6366f1',
            review: '#8b5cf6',
            technical: '#f59e0b',
            demo: '#10b981',
            'one-on-one': '#06b6d4',
        };
        return colors[type] || '#64748b';
    };

    const getMeetingTypeLabel = (type) => {
        const labels = {
            sprint: 'Sprint Planning',
            review: 'Review',
            technical: 'Technical',
            demo: 'Demo',
            'one-on-one': '1:1',
        };
        return labels[type] || type;
    };

    return (
        <div className="meetings-page">
            <TopBar 
                title="Meetings" 
                subtitle={`${meetings.length} meetings scheduled`} 
            />

            <div className="meetings-page__content">
                {meetings.length === 0 ? (
                    <div className="meetings-page__empty">
                        <Calendar size={48} />
                        <h3>No meetings scheduled</h3>
                        <p>Schedule your first meeting to get started</p>
                    </div>
                ) : (
                    <motion.div
                        className="meetings-page__list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {meetings.map((meeting, index) => (
                            <motion.div
                                key={meeting.id}
                                className={`meeting-item card ${expandedId === meeting.id ? 'meeting-item--expanded' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ y: -2 }}
                            >
                                <div
                                    className="meeting-item__header"
                                    onClick={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
                                >
                                    <div className="meeting-item__type-badge" style={{ background: getMeetingTypeColor(meeting.type) }}>
                                        {getMeetingTypeLabel(meeting.type)}
                                    </div>

                                    <div className="meeting-item__title-section">
                                        <h3 className="meeting-item__title">{meeting.title}</h3>
                                        <div className="meeting-item__meta">
                                            <span className="meeting-item__meta-item">
                                                <Calendar size={14} />
                                                {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="meeting-item__meta-item">
                                                <Clock size={14} />
                                                {meeting.time}
                                            </span>
                                            <span className="meeting-item__meta-item">
                                                <Clock size={14} />
                                                {meeting.duration}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="meeting-item__toggle">
                                        <ChevronDown
                                            size={20}
                                            className={expandedId === meeting.id ? 'rotated' : ''}
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === meeting.id && (
                                        <motion.div
                                            className="meeting-item__content"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {/* Attendees */}
                                            <div className="meeting-item__section">
                                                <h4 className="meeting-item__section-title">
                                                    <Users size={16} />
                                                    Attendees
                                                </h4>
                                                <div className="meeting-item__attendees">
                                                    {getMeetingAttendees(meeting.attendees).map(attendee => (
                                                        <div key={attendee.id} className="meeting-attendee">
                                                            <div 
                                                                className="meeting-attendee__avatar"
                                                                style={{ background: attendee.color }}
                                                            >
                                                                {attendee.avatar}
                                                            </div>
                                                            <div className="meeting-attendee__info">
                                                                <span className="meeting-attendee__name">{attendee.name}</span>
                                                                <span className="meeting-attendee__role">{attendee.role}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Meeting Summary */}
                                            <div className="meeting-item__section">
                                                <h4 className="meeting-item__section-title">
                                                    <FileText size={16} />
                                                    Meeting Summary
                                                </h4>
                                                <div className="meeting-item__summary">
                                                    {meeting.summary.split('\n').map((line, i) => {
                                                        if (!line.trim()) return <br key={i} />;
                                                        if (line.startsWith('•')) {
                                                            return (
                                                                <div key={i} className="meeting-item__summary-bullet">
                                                                    {line}
                                                                </div>
                                                            );
                                                        }
                                                        if (line.startsWith('**') && line.endsWith('**')) {
                                                            return (
                                                                <div key={i} className="meeting-item__summary-bold">
                                                                    {line.replace(/\*\*/g, '')}
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div key={i} className="meeting-item__summary-line">
                                                                {line}
                                                            </div>
                                                        );
                                                    })}
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
