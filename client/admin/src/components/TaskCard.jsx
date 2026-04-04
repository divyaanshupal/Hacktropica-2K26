import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, User } from 'lucide-react';
import { teamMembers } from '../data/mockData';
import './TaskCard.css';

const priorityConfig = {
    high: { label: 'High', class: 'badge-danger' },
    medium: { label: 'Medium', class: 'badge-warning' },
    low: { label: 'Low', class: 'badge-success' },
};

const statusConfig = {
    'todo': { label: 'To Do', class: 'badge-info' },
    'in-progress': { label: 'In Progress', class: 'badge-warning' },
    'review': { label: 'In Review', class: 'badge-info' },
    'done': { label: 'Done', class: 'badge-success' },
};

export default function TaskCard({ task, index = 0 }) {
    const assignee = teamMembers.find(m => m.id === task.assigneeId);
    const priority = priorityConfig[task.priority];
    const status = statusConfig[task.status];

    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today && task.status !== 'done';
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    return (
        <motion.div
            className="task-card card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            layout
        >
            <div className="task-card__header">
                <span className={`badge ${priority.class}`}>
                    <AlertCircle size={10} />
                    {priority.label}
                </span>
                <span className={`badge ${status.class}`}>{status.label}</span>
            </div>

            <h3 className="task-card__title">{task.title}</h3>
            <p className="task-card__desc">{task.description}</p>

            <div className="task-card__tags">
                {task.tags.map(tag => (
                    <span key={tag} className="task-card__tag">#{tag}</span>
                ))}
            </div>

            <div className="task-card__footer">
                <div className="task-card__assignee">
                    {assignee && (
                        <>
                            <div className="task-card__avatar" style={{ background: assignee.color }}>
                                {assignee.avatar}
                            </div>
                            <span className="task-card__assignee-name">{assignee.name.split(' ')[0]}</span>
                        </>
                    )}
                </div>
                <div className={`task-card__due ${isOverdue ? 'task-card__due--overdue' : ''}`}>
                    <Clock size={12} />
                    <span>
                        {isOverdue
                            ? `${Math.abs(daysUntilDue)}d overdue`
                            : daysUntilDue === 0
                                ? 'Due today'
                                : `${daysUntilDue}d left`
                        }
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
