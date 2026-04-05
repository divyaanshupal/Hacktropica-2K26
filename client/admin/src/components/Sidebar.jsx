import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Users, Calendar, ChevronLeft, ChevronRight, Zap, MessageCircle } from 'lucide-react';

const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: ListTodo, label: 'Tasks' },
    { path: '/team', icon: Users, label: 'Team Mission Control' },
    { path: '/meetings', icon: Calendar, label: 'Meetings' },
    { path: '/chat', icon: MessageCircle, label: 'Chat Assistant' },
];

export default function Sidebar({ collapsed, onToggle }) {
    const location = useLocation();

    return (
        <aside className={`${collapsed ? 'w-20' : 'w-64'} flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300 shrink-0`}>
            <div className={`flex items-center h-20 border-b border-zinc-800 px-6 ${collapsed ? 'justify-center px-0' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                        <Zap size={20} />
                    </div>
                    {!collapsed && <span className="text-xl font-bold tracking-tight text-white truncate">ProductFlow</span>}
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors relative ${isActive ? 'bg-zinc-800 shadow-sm' : 'hover:bg-zinc-800/50'} ${collapsed ? 'justify-center' : 'justify-start'}`}
                            title={collapsed ? item.label : undefined}
                        >
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />}
                            <Icon size={20} className={`${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                            {!collapsed && <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-zinc-400'}`}>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-800 flex flex-col gap-4">
                <button className={`flex items-center gap-2 p-2 rounded-lg text-zinc-400 hover:text-white transition-colors ${collapsed ? 'justify-center' : 'justify-start'}`} onClick={onToggle}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    {!collapsed && <span className="font-medium text-sm">Collapse</span>}
                </button>

                <div className={`flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-zinc-800 ${collapsed ? 'justify-center' : 'justify-start'}`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs shrink-0">DK</div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-white truncate">Divyanshu K.</span>
                            <span className="text-xs text-zinc-400 truncate">Product Manager</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
