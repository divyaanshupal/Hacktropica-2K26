import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

export default function TopBar({ title, subtitle }) {
    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 shadow-sm">
            <div className="flex">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-white m-0">{title}</h1>
                    {subtitle && <p className="text-sm text-zinc-400 m-0 mt-1">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto">
                <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 flex-1 md:w-[280px]">
                    <Search size={16} className="text-zinc-500 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="bg-transparent border-none outline-none text-sm text-white px-3 w-full placeholder:text-zinc-600"
                    />
                    <kbd className="hidden lg:flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 shrink-0">⌘K</kbd>
                </div>

                <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition" title="Notifications">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                </button>

                <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition" title="Settings">
                    <Settings size={18} />
                </button>
            </div>
        </header>
    );
}
