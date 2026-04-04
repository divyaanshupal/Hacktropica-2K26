import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import './TopBar.css';

export default function TopBar({ title, subtitle }) {
    return (
        <header className="topbar">
            <div className="topbar__left">
                <div className="topbar__title-group">
                    <h1 className="topbar__title">{title}</h1>
                    {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
                </div>
            </div>

            <div className="topbar__right">
                <div className="topbar__search">
                    <Search size={16} className="topbar__search-icon" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="topbar__search-input"
                    />
                    <kbd className="topbar__search-kbd">⌘K</kbd>
                </div>

                <button className="topbar__icon-btn" title="Notifications">
                    <Bell size={18} />
                    <span className="topbar__notification-dot"></span>
                </button>

                <button className="topbar__icon-btn" title="Settings">
                    <Settings size={18} />
                </button>
            </div>
        </header>
    );
}
