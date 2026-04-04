import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Flag, FileText } from 'lucide-react';
import { teamMembers } from '../data/mockData';
import './AddTaskModal.css';

export default function AddTaskModal({ isOpen, onClose, onAdd }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        assigneeId: '',
        priority: 'medium',
        dueDate: '',
        tags: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.assigneeId) return;

        onAdd({
            ...form,
            assigneeId: parseInt(form.assigneeId),
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            status: 'todo',
            createdAt: new Date().toISOString().split('T')[0],
            id: Date.now(),
        });

        setForm({ title: '', description: '', assigneeId: '', priority: 'medium', dueDate: '', tags: '' });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal__header">
                            <h2 className="modal__title">Create New Task</h2>
                            <button className="modal__close" onClick={onClose}>
                                <X size={18} />
                            </button>
                        </div>

                        <form className="modal__form" onSubmit={handleSubmit}>
                            <div className="modal__field">
                                <label className="modal__label">
                                    <FileText size={14} /> Task Title *
                                </label>
                                <input
                                    type="text"
                                    className="modal__input"
                                    placeholder="e.g. Implement user notifications"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="modal__field">
                                <label className="modal__label">
                                    <FileText size={14} /> Description
                                </label>
                                <textarea
                                    className="modal__input modal__textarea"
                                    placeholder="Describe the task in detail..."
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="modal__row">
                                <div className="modal__field">
                                    <label className="modal__label">
                                        <User size={14} /> Assign To *
                                    </label>
                                    <select
                                        className="modal__input modal__select"
                                        value={form.assigneeId}
                                        onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select team member</option>
                                        {teamMembers.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="modal__field">
                                    <label className="modal__label">
                                        <Flag size={14} /> Priority
                                    </label>
                                    <select
                                        className="modal__input modal__select"
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal__row">
                                <div className="modal__field">
                                    <label className="modal__label">
                                        <Calendar size={14} /> Due Date
                                    </label>
                                    <input
                                        type="date"
                                        className="modal__input"
                                        value={form.dueDate}
                                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                    />
                                </div>

                                <div className="modal__field">
                                    <label className="modal__label">Tags</label>
                                    <input
                                        type="text"
                                        className="modal__input"
                                        placeholder="frontend, ui (comma separated)"
                                        value={form.tags}
                                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal__actions">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
