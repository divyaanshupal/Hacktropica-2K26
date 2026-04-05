import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Clock, ArrowLeft, ChevronRight, 
  TriangleAlert, Loader2, Info, Tag, User, Calendar, Play
} from 'lucide-react';

export default function EmployeeTasks({ taskQueue = [] }) {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [error, setError] = useState(null);

  console.log("this is taskq",taskQueue)

const fetchTaskDetails = async (issueId) => {
  if (!issueId) {
    console.error("Invalid task ID:", issueId);
    setError("Invalid task ID");
    return;
  }

  setLoadingTask(true);
  setError(null);

  try {
    console.log("Fetching ID:", issueId);

    const response = await fetch(`http://localhost:5000/api/task/${issueId}`);

    if (!response.ok) throw new Error('Failed to load task');

    const data = await response.json();

    // 🔥 FIX: normalize backend → frontend mismatch
    setTaskDetails({
      ...data,
      taskTitle: data.title,
      estimatedCriticality: data.criticality
    });

    setSelectedTaskId(issueId);

  } catch (err) {
    console.error(err);
    setError('Failed to load task details. Please try again.');
  } finally {
    setLoadingTask(false);
  }
};

  const handleBack = () => {
    setSelectedTaskId(null);
    setTaskDetails(null);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#1f1f23] bg-[#0e0e11]/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedTaskId && (
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-[#1a1a1e] rounded-xl text-gray-400 hover:text-white transition-all border border-transparent hover:border-[#232328]"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {selectedTaskId ? 'Task Details' : 'Task Queue'}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {selectedTaskId ? `Issue ID: ${selectedTaskId}` : `${taskQueue.length} items prioritized by system`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto max-w-5xl w-full mx-auto">
        {loadingTask ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-gray-500 font-medium animate-pulse">Fetching encrypted task data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-400">
            <TriangleAlert size={24} />
            <div>
              <p className="font-bold">Access Denied</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
            <button 
              onClick={handleBack}
              className="ml-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors"
            >
              Return to Queue
            </button>
          </div>
        ) : selectedTaskId && taskDetails ? (
          /* Task Details View */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#121214] border border-[#1f1f23] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent"></div>
               
               <div className="flex justify-between items-start mb-8">
                 <div className="space-y-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${taskDetails.estimatedCriticality >= 8 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {taskDetails.estimatedCriticality >= 8 ? 'Critical Alert' : 'Standard Priority'}
                    </span>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{taskDetails.taskTitle}</h1>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold capitalize">
                      {taskDetails.status || 'Active'}
                    </span>
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#1a1a1e] p-4 rounded-2xl border border-[#232328]">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <TriangleAlert size={14} className="text-red-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Criticality Index</span>
                    </div>
                    <p className="text-xl font-mono font-bold text-white">{taskDetails.estimatedCriticality}/10</p>
                  </div>
                  <div className="bg-[#1a1a1e] p-4 rounded-2xl border border-[#232328]">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Tag size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Module Tag</span>
                    </div>
                    <p className="text-xl font-mono font-bold text-white">{taskDetails.module || 'System'}</p>
                  </div>
                  <div className="bg-[#1a1a1e] p-4 rounded-2xl border border-[#232328]">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Calendar size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Assigned At</span>
                    </div>
                    <p className="text-xl font-mono font-bold text-white">{taskDetails.addedToQueueAt ? new Date(taskDetails.addedToQueueAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Info size={16} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Internal Description</h3>
                  </div>
                  <div className="bg-[#09090b] rounded-2xl p-6 border border-[#1f1f23] text-gray-300 leading-relaxed text-[15px]">
                    {taskDetails.description || 'No detailed system logs available for this task description.'}
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Play size={18} fill="currentColor" />
                Initialize Work Environmet
              </button>
              <button className="px-8 bg-[#1a1a20] text-gray-400 font-bold py-4 rounded-2xl border border-[#232328] hover:text-white transition-colors">
                Delegate
              </button>
            </div>
          </div>
        ) : (
          /* Task List View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {taskQueue.length > 0 ? (
              taskQueue.map((task) => (
                <button 
                  key={task.issueId}
                  onClick={() => fetchTaskDetails(task.issueId || task._id)}
                  className="group text-left bg-[#121214] border border-[#1f1f23] p-6 rounded-[28px] hover:border-indigo-500/30 transition-all hover:bg-[#151518] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                    <ChevronRight size={20} className="text-indigo-400" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${task.estimatedCriticality >= 8 ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-gray-800 text-gray-500 border-transparent'}`}>
                      {task.estimatedCriticality >= 8 ? 'Immediate Action' : 'Backlog Queue'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-600 font-bold">#{task.issueId}</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">{task.taskTitle}</h4>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.03]">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {task.addedToQueueAt ? new Date(task.addedToQueueAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Pending'}
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-12 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${task.estimatedCriticality >= 8 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${task.estimatedCriticality * 10}%` }}></div>
                       </div>
                       <span className={`text-[11px] font-black ${task.estimatedCriticality >= 8 ? 'text-red-400' : 'text-gray-500'}`}>
                        {task.estimatedCriticality}/10
                       </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full bg-[#121214] border border-[#1f1f23] border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#1a1a1e] rounded-full flex items-center justify-center mb-4">
                  <CheckSquare size={32} className="text-gray-700" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Queue Empty</h3>
                <p className="text-sm text-gray-500 max-w-xs">System has not detected any anomalous events for your sector.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
