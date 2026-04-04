import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart2, 
  Folder, 
  Zap, 
  Book, 
  HelpCircle 
} from 'lucide-react';

export default function EmployeeXSidebar() {
  // Simple state to handle active menu item for demonstration
  const [activeItem, setActiveItem] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Tasks', icon: CheckSquare },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Projects', icon: Folder },
    { name: 'AI Insights', icon: Zap },
  ];

  return (
    <aside className="w-[260px] h-screen border-r border-[#1f1f23] flex flex-col justify-between bg-[#121214] text-gray-300 font-sans shrink-0">
      
      {/* --- Top Section --- */}
      <div>
        {/* Logo & Brand */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#242429] p-2 rounded-lg border border-[#2e2e33]">
            <div className="w-5 h-5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-[4px]"></div>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">EmployeeX</h1>
        </div>
        
        {/* Main Navigation */}
        <nav className="px-3 mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            
            return (
              <button 
                key={item.name}
                onClick={() => setActiveItem(item.name)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#1f1f23] text-gray-100' 
                    : 'text-gray-400 hover:bg-[#1a1a1e] hover:text-gray-200'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-gray-300' : 'text-gray-500'}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* --- Bottom Section --- */}
      <div className="px-4 pb-6 space-y-4">
        
        {/* Dev Productivity Status Card */}
        <div className="bg-[#18181b] p-4 rounded-xl border border-[#232328]">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase leading-none">
              Dev Productivity
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Active Session: 4h 20m</p>
        </div>
        
        {/* Footer Links */}
        <div className="space-y-1">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1e] rounded-lg transition-colors">
            <Book className="w-[18px] h-[18px]" />
            <span className="text-sm font-medium">Documentation</span>
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1e] rounded-lg transition-colors">
            <HelpCircle className="w-[18px] h-[18px]" />
            <span className="text-sm font-medium">Support</span>
          </button>
        </div>
        
      </div>
    </aside>
  );
}