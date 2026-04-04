const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

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