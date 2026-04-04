const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Employee = require('../models/Employee');
const Task = require('../models/Task');

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
    const tasks = await Task.find({});
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

    // if (user.password !== password) {
    //   return res.status(401).json({ message: "Wrong password" });
    // }

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