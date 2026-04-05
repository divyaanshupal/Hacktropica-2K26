const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Employee = require('../models/Employee');
const Task = require('../models/Task');

/**
 * GET /api/employee/live?email=...
 * Finds employee by email and returns ONLY specific status and task queue fields.
 * Optimized with Mongoose projection and .lean() for faster performance.
 */
router.get('/employee/live', async (req, res) => {
  try {
    const { email } = req.query;

    // 1. Basic validation for email
    if (!email) {
      return res.status(400).json({ error: "Email query parameter is required" });
    }

    // Email format validation (optional but good practice)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // 2. Find employee with Mongoose projection
    // Return ONLY: currentTaskCriticality, activeTaskTitle, activeTaskDescription, activeIssueId, workload.taskQueue, performance.history
    const employee = await Employee.findOne(
      { email },
      {
        'liveStatus.currentTaskCriticality': 1,
        'liveStatus.activeTaskTitle': 1,
        'liveStatus.activeTaskDescription': 1,
        'liveStatus.activeIssueId': 1,
        'workload.taskQueue': 1,
        'performance.history': 1, // Added for historical tracking
        _id: 0 // Avoid returning the entire document
      }
    ).lean();

    // 3. Handle 404 if employee not found
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 4. Return flattened/optimized response format
    const response = {
      currentTaskCriticality: employee.liveStatus?.currentTaskCriticality ?? 0,
      activeTaskTitle: employee.liveStatus?.activeTaskTitle ?? "",
      activeTaskDescription: employee.liveStatus?.activeTaskDescription ?? "",
      activeIssueId: employee.liveStatus?.activeIssueId ?? null,
      taskQueue: (employee.workload?.taskQueue || []).map(task => ({
        issueId: task.issueId,
        taskTitle: task.taskTitle,
        estimatedCriticality: task.estimatedCriticality,
        addedToQueueAt: task.addedToQueueAt
      })),
      finishedTasks: (employee.performance?.history || []).map(task => ({
        issueId: task.issueId,
        title: task.taskTitle,
        completedAt: task.resolvedAt
      })).reverse() // Show newest first
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching live employee status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- ADD EMPLOYEE ---
router.post('/employees', async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();

    res.status(201).json({
      message: 'Employee hired successfully!',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});


// --- GET ALL EMPLOYEES ---
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});


// --- GET ALL TASKS ---
router.get('/tasks', async (req, res) => {
  try {
    const rawTasks = await Task.find({}).sort({ createdAt: -1 });
    // Sanitize tasks for the frontend
    const tasks = rawTasks.map(t => {
      const task = t.toObject();
      if (task.assignedTo && task.assignedTo.length > 0 && typeof task.assignedTo[0] === 'object') {
          // If the AI accidentally saved a full object or EJSON $oid
          task.assignedTo[0] = task.assignedTo[0].$oid || task.assignedTo[0]._id || task.assignedTo[0];
      }
      return task;
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});


// --- LOGIN EMPLOYEE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      message: "Login successful",
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;