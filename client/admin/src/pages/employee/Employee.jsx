import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, TriangleAlert, RefreshCw, Loader2, 
  ExternalLink, CheckSquare, Calendar, Tag, AlertCircle, Zap
} from 'lucide-react';

export default function InteractiveWorkspace({ setTaskQueue, taskQueue }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [finishedTasks, setFinishedTasks] = useState([]);
  
  // Dashboard Core State
  const [activeTaskData, setActiveTaskData] = useState(null);
  
  const [employee] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('employeeData')) || { name: 'Alex Chen', role: 'Infrastructure', email: 'alex@company.com' };
    } catch {
      return { name: 'Alex Chen', role: 'Infrastructure', email: 'alex@company.com' };
    }
  });

  const handleRefresh = async () => {
    if (!employee?.email) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/employee/live?email=${employee.email}`);
      const data = await response.json();
      
      if (data) {
        // Active Task Details
        setActiveTaskData({
          issueId: data.activeIssueId,
          title: data.activeTaskTitle,
          criticality: data.currentTaskCriticality,
          description: data.activeTaskDescription || "System diagnostic: No additional logs provided.",
          module: data.activeTaskModule || "Core System"
        });
        
        // Upcoming Tasks (Queue)
        setTaskQueue(data.taskQueue || []);
        
        // Previous Finished Tasks (if API provides it, otherwise empty)
        if (data.finishedTasks) {
          setFinishedTasks(data.finishedTasks);
        } else {
          // Fallback to fetching specifically if needed, but for now we'll use state
        }
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsDone = async () => {
    if (!activeTaskData?.issueId || loadingComplete) return;
    
    setLoadingComplete(true);
    try {
      const response = await fetch(`http://localhost:5000/api/task/complete/${activeTaskData.issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to complete task');
      
      // Update Finished Tasks locally for instant feedback
      setFinishedTasks(prev => [{
        ...activeTaskData,
        completedAt: new Date().toISOString()
      }, ...prev]);
      
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

  const getCriticalityColor = (score) => {
    if (score >= 8) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (score >= 5) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="flex-1 bg-[#09090b] text-gray-300 p-8 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <CheckSquare className="text-indigo-500 w-8 h-8" />
             OPERATIONAL WORKSPACE
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">
            {employee.role} sector • Logged as {employee.name}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="bg-[#121214] border border-[#1f1f23] px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          RE-SYNC DATA
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* --- CURRENT ACTIVE TASK CARD --- */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-indigo-400 px-1">
            <Zap className="w-4 h-4 fill-current" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Active Assignment</h2>
          </div>
          
          {activeTaskData ? (
             <div className="bg-[#121214] border border-[#1f1f23] rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-600/50 to-transparent"></div>
                
                <div className="flex flex-col md:flex-row justify-between gap-10">
                   <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getCriticalityColor(activeTaskData.criticality)}`}>
                          CRITICALITY: {activeTaskData.criticality}/10
                        </span>
                        <span className="text-[10px] font-mono text-gray-600 font-bold tracking-widest">#{activeTaskData.issueId}</span>
                      </div>
                      
                      <h3 className="text-4xl font-bold text-white tracking-tight leading-tight">{activeTaskData.title}</h3>
                      
                      <div className="flex flex-wrap gap-8 py-2">
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Assigned Module</p>
                          <div className="flex items-center gap-2 text-gray-300">
                             <Tag size={16} className="text-indigo-400" />
                             <span className="font-bold text-sm">{activeTaskData.module}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Diagnostic Level</p>
                          <div className="flex items-center gap-2 text-gray-300">
                             <AlertCircle size={16} className="text-amber-400" />
                             <span className="font-bold text-sm">System Interrogated</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#09090b] border border-[#1f1f23] rounded-2xl p-6 text-gray-400 text-sm leading-relaxed max-w-2xl">
                         {activeTaskData.description}
                      </div>
                   </div>

                   <div className="flex flex-col justify-end gap-3 min-w-[240px]">
                      <button 
                        onClick={handleMarkAsDone}
                        disabled={loadingComplete}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                      >
                        {loadingComplete ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {loadingComplete ? 'SYNCHRONIZING...' : 'MARK AS COMPLETED'}
                      </button>
                      <button className="w-full bg-[#1c1c21] border border-[#232328] text-gray-400 hover:text-white py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3">
                        <ExternalLink className="w-5 h-5" />
                        FULL CONTEXT
                      </button>
                   </div>
                </div>
             </div>
          ) : (
            <div className="bg-[#121214] border border-dashed border-[#1f1f23] rounded-[2rem] p-20 flex flex-col items-center text-center">
              <Loader2 className="w-10 h-10 text-gray-700 animate-spin mb-4" />
              <p className="text-gray-500 font-bold tracking-tight">WAITING FOR NEXT PRIORITY TASK...</p>
            </div>
          )}
        </section>

        {/* --- DUAL TABLES SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Upcoming Tasks Table */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-amber-500 px-1">
                <Clock className="w-4 h-4" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Prioritized Queue</h2>
             </div>
             
             <div className="bg-[#121214] border border-[#1f1f23] rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-[#0e0e11] border-b border-[#1f1f23]">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Reference</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Task Details</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Criticality</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#1f1f23]">
                      {taskQueue.length > 0 ? taskQueue.map((task, idx) => (
                         <tr key={task.issueId || idx} className="hover:bg-[#161619] transition-colors group">
                            <td className="px-6 py-4 font-mono text-[11px] text-gray-600 font-bold tracking-tighter">
                              #{task.issueId || 'SYS-QX'}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{task.taskTitle}</p>
                              <p className="text-[10px] text-gray-600 font-medium">Added to queue {task.addedToQueueAt ? new Date(task.addedToQueueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${getCriticalityColor(task.estimatedCriticality)}`}>
                                 {task.estimatedCriticality}/10
                               </span>
                            </td>
                         </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center text-gray-600 text-xs font-bold italic tracking-tight">QUEUE IS CURRENTLY NOMINAL</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </section>

          {/* Finished Tasks Table */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-emerald-500 px-1">
                <CheckCircle2 className="w-4 h-4" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Operational History</h2>
             </div>
             
             <div className="bg-[#121214] border border-[#1f1f23] rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-[#0e0e11] border-b border-[#1f1f23]">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">ID</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Resolution</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Closed At</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#1f1f23]">
                      {finishedTasks.length > 0 ? finishedTasks.map((task, idx) => (
                         <tr key={idx} className="hover:bg-[#161619] transition-colors">
                            <td className="px-6 py-4 font-mono text-[11px] text-gray-600 font-bold">
                              #{task.issueId}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-400 line-clamp-1">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-emerald-500 font-black uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded tracking-tighter">DECRYPTED & RESOLVED</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <p className="text-[11px] text-gray-500 font-bold font-mono">
                                 {task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                               </p>
                            </td>
                         </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center text-gray-600 text-xs font-bold italic tracking-tight">NO HISTORICAL DATA DETECTED</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </section>

        </div>

      </div>

    </div>
  );
}

// End of Operational Workspace component