import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ListTodo,
    Users,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Zap,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: ListTodo, label: 'Tasks' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/meetings', icon: Calendar, label: 'Meetings' },
];

export default function Sidebar({ collapsed, onToggle }) {
    const location = useLocation();

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            <div className="sidebar__header">
                <div className="sidebar__logo">
                    <div className="sidebar__logo-icon">
                        <Zap size={20} />
                    </div>
                    {!collapsed && <span className="sidebar__logo-text">ProductFlow</span>}
                </div>
            </div>

            <nav className="sidebar__nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            {isActive && <div className="sidebar__active-indicator" />}
                            <Icon size={20} className="sidebar__link-icon" />
                            {!collapsed && <span className="sidebar__link-label">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar__footer">
                <button className="sidebar__toggle" onClick={onToggle}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    {!collapsed && <span>Collapse</span>}
                </button>

                <div className="sidebar__user">
                    <div className="sidebar__user-avatar">DK</div>
                    {!collapsed && (
                        <div className="sidebar__user-info">
                            <span className="sidebar__user-name">Divyanshu K.</span>
                            <span className="sidebar__user-role">Product Manager</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
