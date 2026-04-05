import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import EmployeeSidebar from './components/EmployeeSidebar'
import Dashboard from './pages/admin/Dashboard'
import Tasks from './pages/admin/Tasks'
import Team from './pages/admin/Team'
import Meetings from './pages/admin/Meetings'
import Chat from './pages/admin/Chat'
import Signin from './pages/employee/Signin'
import InteractiveWorkspace from './pages/employee/Employee'
import { meetings as mockMeetings } from './data/mockData'
import { fetchEmployees, fetchTasks, mapEmployeeData, mapTaskData } from './services/api'
import { Loader2 } from 'lucide-react'
import EmployeeTasks from './pages/employee/Tasks'
import { initialTasks, meetings } from './data/mockData'



function AppContent() {
  const [collapsed, setCollapsed] = useState(false)
  const [tasks, setTasks] = useState(initialTasks)
   const [employees, setEmployees] = useState([])
     const [loading, setLoading] = useState(true)
  const [taskQueue, setTaskQueue] = useState([]) // State for employee tasks
  const location = useLocation()
  
  useEffect(() => {
    const initData = async () => {
      try {
        const [empData, taskData] = await Promise.all([
          fetchEmployees(),
          fetchTasks()
        ])
        setEmployees(empData.map(mapEmployeeData))
        setTasks(taskData.map(mapTaskData))
      } catch (error) {
        console.error("Initialization error:", error)
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

  const isSignin = location.pathname === '/signin'
  const isEmployee = location.pathname.startsWith('/employee')
  const navigate = useNavigate();

  useEffect(() => {
    // Auth Guard: If trying to access /employee and no login data exists, send to signin
    const user = localStorage.getItem('employeeData');
    if (isEmployee && !user) {
      navigate('/signin');
    }
  }, [isEmployee, navigate]);

  if (loading && !isSignin && !isEmployee) {
    return (
      <div className="flex bg-zinc-950 text-white min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <p className="text-sm font-bold uppercase tracking-[0.3em] animate-pulse text-zinc-500">Initializing CORTEX...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-zinc-950 text-white min-h-screen overflow-hidden text-sm w-full">
      {isSignin ? null : (isEmployee ? (
        <EmployeeSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      ) : (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      ))}
      
      <main className="flex-1 overflow-y-auto flex flex-col items-center relative">
        <div className={`w-full ${isSignin ? '' : 'max-w-7xl px-6 md:px-10 py-6 md:py-10 mx-auto'}`}>
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/" element={<Dashboard tasks={tasks} employees={employees} meetings={mockMeetings} />} />
          <Route path="/tasks" element={<Tasks tasks={tasks} setTasks={setTasks} employees={employees} />} />
          <Route path="/team" element={<Team tasks={tasks} setTasks={setTasks} employees={employees} />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/employee" element={<InteractiveWorkspace setTaskQueue={setTaskQueue} taskQueue={taskQueue} />} />
          <Route path="/employee/tasks" element={<EmployeeTasks taskQueue={taskQueue} />} />
        </Routes>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
