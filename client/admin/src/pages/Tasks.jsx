import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, LayoutGrid, List, CheckCircle2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import './Tasks.css';

const statusTabs = [
    { key: 'all', label: 'All', icon: null },
    { key: 'todo', label: 'To Do', color: '#3b82f6' },
    { key: 'in-progress', label: 'In Progress', color: '#f59e0b' },
    { key: 'review', label: 'Review', color: '#8b5cf6' },
    { key: 'done', label: 'Done', color: '#10b981' },
];

export default function Tasks({ tasks, setTasks }) {
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = activeTab === 'all' || task.status === activeTab;
            const matchesSearch = !search ||
                task.title.toLowerCase().includes(search.toLowerCase()) ||
                task.description.toLowerCase().includes(search.toLowerCase()) ||
                task.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
            return matchesStatus && matchesSearch;
        });
    }, [tasks, activeTab, search]);

    const handleAddTask = (newTask) => {
        setTasks(prev => [newTask, ...prev]);
    };

    const getTabCount = (key) => {
        if (key === 'all') return tasks.length;
        return tasks.filter(t => t.status === key).length;
    };

    return (
        <div className="tasks-page">
            <TopBar title="Tasks" subtitle={`${tasks.length} total tasks across your team`} />

            <div className="tasks-page__content">
                {/* Controls */}
                <div className="tasks-page__controls">
                    <div className="tasks-page__tabs">
                        {statusTabs.map(tab => (
                            <button
                                key={tab.key}
                                className={`tasks-page__tab ${activeTab === tab.key ? 'tasks-page__tab--active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.color && (
                                    <span className="tasks-page__tab-dot" style={{ background: tab.color }} />
                                )}
                                {tab.label}
                                <span className="tasks-page__tab-count">{getTabCount(tab.key)}</span>
                            </button>
                        ))}
                    </div>

                    <div className="tasks-page__actions">
                        <div className="tasks-page__search">
                            <Search size={14} />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="tasks-page__view-toggle">
                            <button
                                className={`tasks-page__view-btn ${viewMode === 'grid' ? 'tasks-page__view-btn--active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                className={`tasks-page__view-btn ${viewMode === 'list' ? 'tasks-page__view-btn--active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={16} />
                            </button>
                        </div>

                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} /> Add Task
                        </button>
                    </div>
                </div>

                {/* Kanban View */}
                {viewMode === 'grid' && activeTab === 'all' ? (
                    <div className="tasks-page__kanban">
                        {statusTabs.filter(t => t.key !== 'all').map(status => {
                            const statusTasks = tasks.filter(t => t.status === status.key);
                            return (
                                <div key={status.key} className="tasks-page__column">
                                    <div className="tasks-page__column-header">
                                        <span className="tasks-page__column-dot" style={{ background: status.color }} />
                                        <h3 className="tasks-page__column-title">{status.label}</h3>
                                        <span className="tasks-page__column-count">{statusTasks.length}</span>
                                    </div>
                                    <div className="tasks-page__column-list">
                                        <AnimatePresence>
                                            {statusTasks.map((task, i) => (
                                                <TaskCard key={task.id} task={task} index={i} />
                                            ))}
                                        </AnimatePresence>
                                        {statusTasks.length === 0 && (
                                            <div className="tasks-page__empty-column">
                                                <CheckCircle2 size={24} />
                                                <span>No tasks</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* List / Filtered Grid */
                    <motion.div
                        className={`tasks-page__list ${viewMode === 'list' ? 'tasks-page__list--rows' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AnimatePresence>
                            {filteredTasks.map((task, i) => (
                                <TaskCard key={task.id} task={task} index={i} />
                            ))}
                        </AnimatePresence>
                        {filteredTasks.length === 0 && (
                            <div className="tasks-page__no-results">
                                <Search size={32} />
                                <p>No tasks found matching your filters</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            <AddTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddTask}
            />
        </div>
    );
}
