import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Flag, FileText } from 'lucide-react';
import { teamMembers } from '../data/mockData';

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
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-[#1c1f2e] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white">Create New Task</h2>
                            <button className="text-slate-400 hover:text-white transition-colors" onClick={onClose}>
                                <X size={18} />
                            </button>
                        </div>

                        <form className="p-6 flex flex-col gap-5" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <FileText size={14} /> Task Title *
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                                    placeholder="e.g. Implement user notifications"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <FileText size={14} /> Description
                                </label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors min-h-[80px] resize-y"
                                    placeholder="Describe the task in detail..."
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <User size={14} /> Assign To *
                                    </label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors appearance-none cursor-pointer"
                                        value={form.assigneeId}
                                        onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                                        required
                                    >
                                        <option value="" className="bg-[#1c1f2e] text-white">Select team member</option>
                                        {teamMembers.map(m => (
                                            <option key={m.id} value={m.id} className="bg-[#1c1f2e] text-white">{m.name} — {m.role}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Flag size={14} /> Priority
                                    </label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors appearance-none cursor-pointer"
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                    >
                                        <option value="low" className="bg-[#1c1f2e] text-white">Low</option>
                                        <option value="medium" className="bg-[#1c1f2e] text-white">Medium</option>
                                        <option value="high" className="bg-[#1c1f2e] text-white">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Calendar size={14} /> Due Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors scheme-dark"
                                        value={form.dueDate}
                                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">Tags</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                                        placeholder="frontend, ui (comma separated)"
                                        value={form.tags}
                                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-2">
                                <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-linear-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 hover:-translate-y-px hover:shadow-indigo-500/40 transition-all flex items-center gap-2 cursor-pointer">
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
