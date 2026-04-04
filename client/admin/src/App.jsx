import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import EmployeeSidebar from './components/EmployeeSidebar'
import Dashboard from './pages/admin/Dashboard'
import Tasks from './pages/admin/Tasks'
import Team from './pages/admin/Team'
import Meetings from './pages/admin/Meetings'
import Chat from './pages/admin/Chat'
import Signin from './pages/employee/Signin'
import { initialTasks, meetings } from './data/mockData'

function AppContent() {
  const [collapsed, setCollapsed] = useState(false)
  const [tasks, setTasks] = useState(initialTasks)
  const location = useLocation()
  const isEmployee = location.pathname.startsWith('/employee')
  const isSignin = location.pathname === '/signin'

  return (
    <div className="flex bg-zinc-950 text-white min-h-screen overflow-hidden text-sm w-full">
      {!isSignin && (isEmployee ? (
        <EmployeeSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      ) : (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      ))}
      
      <main className="flex-1 overflow-y-auto flex flex-col items-center relative">
        <div className={`w-full ${isSignin ? '' : 'max-w-7xl px-6 md:px-10 py-6 md:py-10 mx-auto'}`}>
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/" element={<Dashboard tasks={tasks} meetings={meetings} />} />
          <Route path="/tasks" element={<Tasks tasks={tasks} setTasks={setTasks} />} />
          <Route path="/team" element={<Team tasks={tasks} />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/employee" element={<Signin />} />
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
