import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper for mapping employee data from MongoDB to Frontend expectations
export const mapEmployeeData = (employee) => {
    // Generate initials for avatar
    const initials = employee.name
        ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : '??';

    // Map sector to roles used in color/icon logic
    const roleColors = {
        'AI & Machine Learning': '#8b5cf6',
        'Cybersecurity': '#10b981',
        'Backend Developer': '#06b6d4',
        'Frontend Developer': '#6366f1',
        'DevOps': '#ef4444',
        'Cloud': '#f59e0b'
    };

    return {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.sector, // UI expects 'role'
        avatar: initials,
        color: roleColors[employee.sector] || '#64748b',
        status: employee.liveStatus?.isPresentToday ? 'online' : 'offline',
        currentActivity: employee.liveStatus?.currentActivity,
        
        // Map tasks logic
        activeTask: employee.liveStatus?.activeTaskTitle ? {
            id: employee.liveStatus.activeIssueId || 'current',
            title: employee.liveStatus.activeTaskTitle,
            description: employee.liveStatus.activeTaskDescription,
            criticality: employee.liveStatus.currentTaskCriticality || 0,
        } : null,
        
        queue: employee.workload?.taskQueue || [],
        stats: {
            capacity: employee.workload?.capacity || 5,
            activeCount: employee.workload?.activeTasksCount || 0,
            score: employee.workload?.workloadScore || 0,
        },
        performance: employee.performance || {}
    };
};

export const mapTaskData = (task) => {
    // Priority logic: Map 1-10 criticality to low/medium/high/critical
    let priority = 'low';
    if (task.criticality >= 9) priority = 'critical';
    else if (task.criticality >= 7) priority = 'high';
    else if (task.criticality >= 4) priority = 'medium';

    // Status logic: Map MongoDB 'open' to 'todo'
    // Map 'done' to 'done'
    const status = task.status === 'open' ? 'todo' : task.status;

    // Due date logic: Fallback to 3 days after creation if not present
    const createdAt = task.createdAt ? new Date(task.createdAt) : new Date();
    const dueDate = new Date(createdAt);
    dueDate.setDate(dueDate.getDate() + 3);

    return {
        id: task._id,
        title: task.title,
        description: task.description,
        status: status,
        priority: priority,
        assigneeId: task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : null,
        tags: task.sector || [],
        dueDate: dueDate.toISOString(),
        criticality: task.criticality,
        createdAt: task.createdAt,
    };
};

export const fetchEmployees = async () => {
    try {
        const response = await api.get('/employees');
        return response.data;
    } catch (error) {
        console.error('API Error (fetchEmployees):', error);
        throw error;
    }
};

export const fetchTasks = async () => {
    try {
        const response = await api.get('/tasks');
        return response.data;
    } catch (error) {
        console.error('API Error (fetchTasks):', error);
        throw error;
    }
};

export default api;
