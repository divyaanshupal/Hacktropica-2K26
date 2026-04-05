import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, LayoutGrid, List, CheckCircle2, Sparkles, Send, Loader2 } from 'lucide-react';
import TopBar from '../../components/TopBar';
import TaskCard from '../../components/TaskCard';
import AddTaskModal from '../../components/AddTaskModal';

const priorityTabs = [
    { key: 'all', label: 'All', icon: null },
    { key: 'low', label: 'Low', color: '#10b981' },
    { key: 'medium', label: 'Medium', color: '#f59e0b' },
    { key: 'high', label: 'High', color: '#ef4444' },
    { key: 'critical', label: 'Critical', color: '#dc2626' },
];

export default function Tasks({ tasks, setTasks, employees }) {
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [agentQuery, setAgentQuery] = useState('');
    const [isAgentLoading, setIsAgentLoading] = useState(false);
    const [agentStatus, setAgentStatus] = useState(null); // 'success', 'error'

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesTab = activeTab === 'all' || task.priority === activeTab;
            const matchesSearch = !search ||
                task.title.toLowerCase().includes(search.toLowerCase()) ||
                task.description.toLowerCase().includes(search.toLowerCase()) ||
                (task.tags && task.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
            return matchesTab && matchesSearch;
        });
    }, [tasks, activeTab, search]);

    const handleAddTask = (newTask) => {
        setTasks(prev => [newTask, ...prev]);
    };

    const getTabCount = (key) => {
        if (key === 'all') return tasks.length;
        return tasks.filter(t => t.priority === key).length;
    };

    const handleAgentDispatch = async () => {
        if (!agentQuery.trim()) return;
        setIsAgentLoading(true);
        setAgentStatus(null);
        try {
            const response = await fetch('https://hacktropia.app.n8n.cloud/webhook/admin-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: agentQuery })
            });
            if (response.ok) {
                setAgentStatus('success');
                setAgentQuery('');
                setTimeout(() => setAgentStatus(null), 3000);
            } else {
                setAgentStatus('error');
            }
        } catch (err) {
            console.error('Agent dispatch error:', err);
            setAgentStatus('error');
        } finally {
            setIsAgentLoading(false);
        }
    };

    return (
        <div className="w-full flex-col">
            <TopBar title="Tasks" subtitle={`${tasks.length} total tasks prioritized by urgency`} />

            <div className="flex flex-col gap-8">
                {/* AI Agent Dispatch */}
                <motion.div 
                    className="p-6 bg-zinc-900 border border-blue-500/20 rounded-3xl shadow-lg relative overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                     <div className="absolute top-0 right-0 p-1 opacity-20"><Sparkles size={120} className="text-blue-500" /></div>
                     <div className="relative z-10 flex flex-col md:flex-row gap-4 items-end md:items-center">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                                <Sparkles size={12} className="animate-pulse" /> AI Agent Dispatch
                            </label>
                            <input 
                                type="text" 
                                placeholder="Describe the task (e.g. Change landing page color scheme urgently for frontend)"
                                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-blue-500/50 outline-none rounded-2xl px-6 py-4 text-white text-base placeholder:text-zinc-600 transition-all font-medium"
                                value={agentQuery}
                                onChange={(e) => setAgentQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAgentDispatch()}
                            />
                        </div>
                        <button 
                            className={`px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shrink-0 ${isAgentLoading ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'}`}
                            onClick={handleAgentDispatch}
                            disabled={isAgentLoading || !agentQuery.trim()}
                        >
                            {isAgentLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                            Dispatch Agent
                        </button>
                     </div>
                     {agentStatus && (
                        <div className={`mt-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit ${agentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {agentStatus === 'success' ? 'Task Analyzed & Dispatched Successfully' : 'Failed to reach agent'}
                        </div>
                     )}
                </motion.div>

                {/* Controls */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-zinc-800/80 pb-6">
                    <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
                        {priorityTabs.map(tab => (
                            <button
                                key={tab.key}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${activeTab === tab.key ? 'bg-zinc-900 border-zinc-700 text-white shadow-sm' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.color && (
                                    <span className={`w-2.5 h-2.5 rounded-full ${tab.key === 'critical' ? 'animate-pulse shadow-[0_0_8px_#dc2626]' : 'shadow-inner'}`} style={{ background: tab.color }} />
                                )}
                                {tab.label}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 ${activeTab === tab.key ? 'text-zinc-300' : 'text-zinc-500'}`}>{getTabCount(tab.key)}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl flex-1 xl:w-auto min-w-[200px]">
                            <Search size={16} className="text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-zinc-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
                            <button
                                className={`p-1.5 rounded-lg flex items-center justify-center transition ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                                onClick={() => setViewMode('grid')}
                                title="Board View"
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                className={`p-1.5 rounded-lg flex items-center justify-center transition ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <List size={16} />
                            </button>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-sm font-bold transition shadow-sm" onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} /> <span className="hidden sm:inline">Add Task</span>
                        </button>
                    </div>
                </div>

                {/* Kanban View */}
                {viewMode === 'grid' && activeTab === 'all' ? (
                    <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar items-start min-h-[60vh]">
                        {priorityTabs.filter(t => t.key !== 'all').map(priority => {
                            const priorityTasks = tasks.filter(t => t.priority === priority.key);
                            return (
                                <div key={priority.key} className={`flex flex-col w-[320px] shrink-0 bg-zinc-900/30 border rounded-2xl p-4 ${priority.key === 'critical' ? 'border-red-500/30 bg-red-950/5' : 'border-zinc-800/50'}`}>
                                    <div className="flex items-center gap-3 mb-4 px-2">
                                        <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${priority.key === 'critical' ? 'animate-pulse' : ''}`} style={{ background: priority.color, boxShadow: `0 0 8px ${priority.color}80` }} />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">{priority.label}</h3>
                                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2.5 py-0.5 rounded-full ml-auto">{priorityTasks.length}</span>
                                    </div>
                                    <div className="flex flex-col gap-3 min-h-[100px]">
                                        <AnimatePresence>
                                            {priorityTasks.map((task, i) => (
                                                <TaskCard key={task.id} task={task} index={i} employees={employees} />
                                            ))}
                                        </AnimatePresence>
                                        {priorityTasks.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-32 gap-3 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
                                                <CheckCircle2 size={24} className="opacity-50" />
                                                <span className="text-xs font-semibold uppercase tracking-widest">Clear</span>
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
                        className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AnimatePresence>
                            {filteredTasks.map((task, i) => (
                                <TaskCard key={task.id} task={task} index={i} employees={employees} />
                            ))}
                        </AnimatePresence>
                        {filteredTasks.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 text-zinc-500 gap-4">
                                <Search size={48} className="opacity-20" />
                                <p className="text-sm font-medium">No tasks found matching your filters</p>
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
