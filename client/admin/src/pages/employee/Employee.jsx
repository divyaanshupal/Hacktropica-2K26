import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, CheckSquare, BarChart2, Folder, Zap, Search, Bell, 
  Settings, Clock, TerminalSquare, Play, Book, HelpCircle, Pause,
  TriangleAlert, Brain, Loader2, RefreshCw, BarChart, Target, CheckCircle2
} from 'lucide-react';

// --- MAIN DASHBOARD COMPONENT ---
export default function InteractiveWorkspace({ setTaskQueue, taskQueue }) {
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [activeTask, setActiveTask] = useState('#AUTH-294');
  const [taskTitle, setTaskTitle] = useState('Refactor Auth Service');

  // New States for API Integration
  const [lastCritical, setLastCritical] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  // Dashboard Metrics from API
  const [taskCompletion, setTaskCompletion] = useState(85);
  const [workload, setWorkload] = useState(64);

  // Pull employee details from localStorage (saved during Signin)
  const [employee, setEmployee] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('employeeData')) || { name: 'Alex Chen', role: 'Infrastructure', email: 'alex@company.com' };
    } catch {
      return { name: 'Alex Chen', role: 'Infrastructure', email: 'alex@company.com' };
    }
  });

  // 1. Live Timer State
  const [sessionSeconds, setSessionSeconds] = useState(0); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isTimerRunning) {
      timer = setInterval(() => setSessionSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // 2. Simulated Terminal Logs State
  const [logs, setLogs] = useState([
    { id: 1, time: '14:22:01', level: 'INFO', msg: 'Initializing OAuth Provider...', color: 'text-emerald-400' },
    { id: 2, time: '14:22:05', level: 'INFO', msg: 'Connection to Redis cluster established.', color: 'text-emerald-400' }
  ]);
  const logsEndRef = useRef(null);

  // Manual Refresh Logic
  const handleRefresh = async () => {
    if (!employee?.email) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/employee/live?email=${employee.email}`);
      const data = await response.json();
      
      if (data) {
        setActiveTask(data.activeIssueId || activeTask);
        setTaskTitle(data.activeTaskTitle || taskTitle);
        setTaskQueue(data.taskQueue || []);
        
        // Update metrics if available
        if (data.taskCompletion !== undefined) setTaskCompletion(data.taskCompletion);
        if (data.workload !== undefined) setWorkload(data.workload);
        
        // Criticality Alert Logic
        const currentCrit = data.currentTaskCriticality || 0;
        if (currentCrit >= 8 && lastCritical < 8) {
          setShowCriticalModal(true);
        }
        setLastCritical(currentCrit);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark as Done Logic
  const handleMarkAsDone = async () => {
    if (!activeTask || loadingComplete) return;
    
    // Extract actual numeric or string ID from activeTask (e.g., #AUTH-294 -> AUTH-294)
    const taskId = activeTask.replace('#', '');
    setLoadingComplete(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/task/complete/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("this is the task id:",taskId)
      if (!response.ok) throw new Error('Failed to complete task');
      
      // Successfully completed, now refresh dashboard to get new active task
      await handleRefresh();
      
    } catch (error) {
      console.error("Complete task error:", error);
    } finally {
      setLoadingComplete(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handle task pause/resume (local state only for UI feedback)
  const toggleTask = (taskId) => {
    setTaskQueue(tasks => tasks.map(t => ({
      ...t,
      status: t._id === taskId ? (t.status === 'running' ? 'paused' : 'running') : 'paused'
    })));
  };

  const handleAcceptCriticalTask = () => {
    setShowCriticalModal(false);
    setActiveTask('#DB-8829-X');
    setTaskTitle('Resolve DB Pool Saturation');
    
    // Timer starts from zero when developer accepts
    setSessionSeconds(0);
    setIsTimerRunning(true);
    
    setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString('en-US', { hour12: false }), level: 'CRITICAL', msg: 'Emergency task accepted. Connecting to db-prod-01...', color: 'text-rose-500' }]);
  };

  return (
    <div className="flex h-screen bg-[#0e0e11] text-gray-300 font-sans overflow-hidden selection:bg-gray-700 relative">
      
      {/* Sidebar Navigation */}
     
      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto z-0 relative">
        <header className="flex justify-between items-center px-8 py-5">
          <div className="flex items-center gap-3 bg-[#121214] border border-[#1f1f23] rounded-full px-4 py-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs text-blue-400 font-bold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-300 font-medium leading-none mb-1">Employee: {employee.name}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] text-emerald-500 font-bold tracking-wide uppercase leading-none">{employee.role} · Online</span>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1e] border border-[#232328] rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Dashboard
          </button>
        </header>

        <div className="px-8 pb-8 max-w-4xl">
          {/* Header & Live Timer */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 border text-[10px] font-bold tracking-wider rounded uppercase ${activeTask.includes('DB') ? 'bg-[#3a1d22] text-[#f43f5e] border-[#5c212a]' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                  {activeTask.includes('DB') ? 'Emergency' : 'Critical'}
                </span>
                <span className="text-gray-400 text-sm">Task ID: {activeTask}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white tracking-tight">{taskTitle}</h2>
                <button 
                  onClick={handleMarkAsDone}
                  disabled={loadingComplete}
                  className="mr-6 flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-[#0e0e11] rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:grayscale active:scale-95"
                >
                  {loadingComplete ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {loadingComplete ? 'Processing...' : 'Mark as Done'}
                </button>
              </div>
            </div>
            
            <div className="bg-[#18181c] border border-[#232328] rounded-xl p-3 px-5 text-right shadow-lg">
              <div className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1">Session Timer</div>
              <div className="text-xl font-mono text-gray-200 font-semibold mb-0.5">{formatTime(sessionSeconds)}</div>
              <div className="text-[10px] text-emerald-500 flex justify-end items-center gap-1.5 font-medium">
                 <div className={`w-1.5 h-1.5 bg-emerald-500 rounded-full ${isTimerRunning ? 'animate-pulse' : ''}`}></div>
                 {isTimerRunning ? 'Active Session' : 'Standby'}
              </div>
            </div>
          </div>

          {/* Dynamic Terminal Logs */}
          <div className="bg-[#09090b] border border-[#1f1f23] rounded-2xl overflow-hidden mb-8 shadow-xl shadow-black/40">
            <div className="bg-[#121214] border-b border-[#1f1f23] px-4 py-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]"></div>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Runtime Logs</span>
              <TerminalSquare className="w-4 h-4 text-gray-600" />
            </div>
            <div className="p-5 font-mono text-xs leading-relaxed h-48 overflow-y-auto scrollbar-hide">
              {logs.map((log) => (
                <div key={log.id} className="mb-1.5">
                  <span className="text-gray-600">[{log.time}]</span>{' '}
                  <span className={log.color}>{log.level}</span>{' '}
                  <span className="text-gray-400">{log.msg}</span>
                </div>
              ))}
              <div ref={logsEndRef} className="text-gray-600 pt-2 flex items-center gap-2">
                <span>{`> Listening for events`}</span>
                <span className="flex gap-0.5">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                </span>
              </div>
            </div>
          </div>

          {/* New Metrics Section */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#121214] border border-[#1f1f23] p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Target size={20} />
                </div>
                <span className="text-2xl font-bold text-white">{taskCompletion}%</span>
              </div>
              <p className="text-sm font-semibold text-gray-200 mb-1 tracking-tight">Task Completion</p>
              <p className="text-xs text-gray-500 mb-4 font-medium">Sprint goal progress</p>
              <div className="h-1.5 w-full bg-[#1c1c21] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${taskCompletion}%` }}
                />
              </div>
            </div>

            <div className="bg-[#121214] border border-[#1f1f23] p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <BarChart size={20} />
                </div>
                <span className="text-2xl font-bold text-white">{workload}%</span>
              </div>
              <p className="text-sm font-semibold text-gray-200 mb-1 tracking-tight">Current Workload</p>
              <p className="text-xs text-gray-500 mb-4 font-medium">System utilization</p>
              <div className="h-1.5 w-full bg-[#1c1c21] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${workload}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Task Queue */}
      <aside className="w-[320px] border-l border-[#1f1f23] bg-[#0e0e11] flex flex-col relative z-0">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-200 mb-1">Next Up</h3>
          <p className="text-xs text-gray-500 mb-6">Smart-sorted by priority score</p>

          <div className="space-y-4">
            {taskQueue.map((task) => (
              <div key={task._id || task.id} className={`border rounded-xl p-4 transition-colors ${task.status === 'running' ? 'bg-[#18181c] border-[#3f3f46]' : 'bg-[#121214] border-[#1f1f23]'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className={`text-sm font-semibold ${task.status === 'running' ? 'text-gray-200' : 'text-gray-400'}`}>{task.taskTitle}</h4>
                  <span className="bg-[#1f1f23] text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded">{task.estimatedCriticality}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  {task.addedToQueueAt ? new Date(task.addedToQueueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                </div>
                <button 
                  onClick={() => toggleTask(task._id || task.id)}
                  className={`w-full text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    task.status === 'running' 
                      ? 'bg-[#e4e4e7] text-[#09090b] hover:bg-white' 
                      : 'bg-[#1a1a1e] text-gray-400 border border-[#232328] hover:bg-[#232328]'
                  }`}
                >
                  {task.status === 'running' ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {task.status === 'running' ? 'Pause Task' : 'Resume Task'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger Critical Modal Button */}
        <div className="absolute bottom-6 right-6 left-6">
          <button 
            onClick={() => setShowCriticalModal(true)}
            className="w-full text-left bg-linear-to-br from-[#242429] to-[#1a1a1e] border border-[#333339] p-3 rounded-2xl flex items-center gap-3 shadow-2xl hover:border-red-500/50 transition-colors group"
          >
            <div className="bg-[#333339] group-hover:bg-red-500/20 p-2 rounded-xl transition-colors">
              <Zap className="w-5 h-5 text-gray-300 group-hover:text-red-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-0.5">Developer Tool</div>
              <div className="text-sm font-medium text-gray-200">Trigger Alert Modal</div>
            </div>
          </button>
        </div>
      </aside>

      {/* --- CRITICAL MODAL OVERLAY --- */}
      {showCriticalModal && (
        <CriticalIssueTrigger onAccept={handleAcceptCriticalTask} onDelegate={() => setShowCriticalModal(false)} />
      )}

    </div>
  );
}

// --- MODAL COMPONENT ---
function CriticalIssueTrigger({ onAccept, onDelegate }) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptClick = () => {
    setIsAccepting(true);
    // Simulate network delay before closing modal
    setTimeout(() => {
      onAccept();
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0%,transparent_50%)] pointer-events-none"></div>

      <div className="relative w-full max-w-[520px] bg-[#141416] rounded-3xl p-8 md:p-10 border border-white/[0.08] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-linear-to-r from-transparent via-red-500/70 to-transparent shadow-[0_0_40px_15px_rgba(239,68,68,0.2)]"></div>

        <div className="mx-auto w-16 h-16 rounded-full bg-[#2d1618] border border-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
          <TriangleAlert className="w-7 h-7 text-[#ef4444]" strokeWidth={2.5} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-white tracking-tight mb-3">CRITICAL ISSUE DETECTED</h1>
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#3a1b20] border border-red-500/20">
            <span className="text-[#e26d75] text-[10px] font-bold tracking-[0.2em] uppercase">Level 0 Emergency</span>
          </div>
        </div>

        <div className="bg-[#1a1a1d] rounded-xl p-6 mb-8 border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-gray-400" />
            <h2 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">AI Diagnostic Summary</h2>
          </div>
          <p className="text-[15px] text-gray-200 leading-relaxed mb-5 font-medium">
            Database connection pool saturation detected in production. Immediate intervention required.
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="px-2.5 py-1.5 bg-[#0a0a0c] rounded text-[10px] font-mono font-medium text-gray-400 border border-white/[0.05]">db-prod-01</div>
            <div className="px-2.5 py-1.5 bg-[#0a0a0c] rounded text-[10px] font-mono font-medium text-gray-400 border border-white/[0.05]">LATENCY: 450ms</div>
            <div className="px-2.5 py-1.5 bg-[#0a0a0c] rounded text-[10px] font-mono font-medium text-gray-400 border border-white/[0.05]">CPU: 94%</div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button 
            onClick={handleAcceptClick}
            disabled={isAccepting}
            className="flex-1 bg-linear-to-r from-[#e7747e] to-[#d45d68] hover:from-[#ed848d] hover:to-[#db6975] text-[#141416] font-bold text-[15px] py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(231,116,126,0.15)] group disabled:opacity-70"
          >
            {isAccepting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>
            ) : (
              <><Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Accept Task</>
            )}
          </button>
          
          <button 
            onClick={onDelegate}
            disabled={isAccepting}
            className="px-8 bg-[#252529] hover:bg-[#2d2d31] text-gray-200 font-semibold text-[15px] py-4 rounded-lg transition-colors border border-white/[0.05] disabled:opacity-50"
          >
            Delegate
          </button>
        </div>

        <div className="text-center text-[11px] text-gray-500 font-medium">
          Incident #ID-8829-X • Detected just now
        </div>
      </div>
    </div>
  );
}