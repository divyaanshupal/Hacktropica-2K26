import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ChatBot from './components/ChatBot'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Team from './pages/Team'
import Meetings from './pages/Meetings'
import { initialTasks, meetings } from './data/mockData'
import './App.css'

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [tasks, setTasks] = useState(initialTasks)

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        
        <main className="app__main">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} meetings={meetings} />} />
            <Route path="/tasks" element={<Tasks tasks={tasks} setTasks={setTasks} />} />
            <Route path="/team" element={<Team tasks={tasks} />} />
            <Route path="/meetings" element={<Meetings />} />
          </Routes>
        </main>

        <ChatBot />
      </div>
    </BrowserRouter>
  )
}

export default App
