const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

/**
 * GET /api/task/:id
 * Fetches task details by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const task = await Task.findById(id).lean();

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const response = {
      title: task.title,
      description: task.description,
      criticality: task.criticality,
      status: task.status,
      startedAt: task.startedAt,
      completedAt: task.completedAt
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching task details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PATCH /api/task/complete/:id
 * Marks a task as completed and updates employee workload/history.
 * 
 * Logic:
 * 1. Mark task as 'done' and set completedAt.
 * 2. Find employee working on this task.
 * 3. Update employee: increment completed count, add to history, clear active status.
 * 4. Pull next task from queue (sorted by criticality) if available.
 */


// Assuming your models are imported here:
// const Task = require('../models/Task'); // Or Issue, depending on your setup
// const Employee = require('../models/Employee');

router.patch('/complete/:id', async (req, res) => {
  try {
    const { id: taskId } = req.params;
    console.log("➡️ PATCH /complete hit with ID:", taskId);

    // 1. Validate and Cast ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.log("❌ Invalid task ID");
      return res.status(400).json({ error: "Invalid task ID" });
    }
    const objectIdTask = new mongoose.Types.ObjectId(taskId);

    // 2. Find and Update the Task/Issue
    const task = await Task.findById(objectIdTask);
    if (!task) {
      console.log("❌ Task not found");
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = "done";
    task.completedAt = new Date();
    await task.save();
    console.log("✅ Task marked as done:", task._id);

    const cleanTaskId = taskId.trim();

    // 3. Find the assigned Employee
    // Robust search: Converts DB field to string before comparison to handle type mismatches
    let employee = await Employee.findOne({
      $expr: {
        $eq: [
          { $toString: { $ifNull: ["$liveStatus.activeIssueId", ""] } },
          cleanTaskId
        ]
      }
    });

    // Final fallback match (manual search) if high-level query fails
    if (!employee) {
      const allEmployees = await Employee.find({});
      employee = allEmployees.find(e => 
        e.liveStatus && e.liveStatus.activeIssueId && e.liveStatus.activeIssueId.toString() === cleanTaskId
      );
    }
    
    console.log(`👤 Employee search for ${cleanTaskId}:`, employee ? employee.email : "Not found (Final attempt)");

    let newActiveTask = null;

    if (employee) {
      // 4. Update Performance (The Profiler)
      employee.performance.tasksCompleted = (employee.performance.tasksCompleted || 0) + 1;
      employee.performance.history.push({
        issueId: objectIdTask,
        taskTitle: task.title || task.name || "Unknown Task",
        resolvedAt: new Date()
      });

      // 5. Clear Current Live Status
      employee.liveStatus.activeIssueId = null;
      employee.liveStatus.activeTaskTitle = null;
      employee.liveStatus.activeTaskDescription = null;
      employee.liveStatus.currentTaskCriticality = 0;

      // 6. Manage Workload & Smart Queue
      if (employee.workload && employee.workload.taskQueue) {
        // Robust removal: Handle both string and ObjectId match
        employee.workload.taskQueue = employee.workload.taskQueue.filter(
          (item) => item.issueId && item.issueId.toString() !== taskId.toString()
        );
        
        // Decrement the active tasks count
        if (employee.workload.activeTasksCount > 0) {
           employee.workload.activeTasksCount -= 1;
        }

        // 7. Auto-Dispatch Next Task
        if (employee.workload.taskQueue.length > 0) {
          // Sort remaining queue by highest criticality
          employee.workload.taskQueue.sort(
            (a, b) => b.estimatedCriticality - a.estimatedCriticality
          );

          // Pop the most urgent task
          const nextTask = employee.workload.taskQueue.shift(); 

          // Populate live status with the new task
          employee.liveStatus.activeIssueId = nextTask.issueId;
          employee.liveStatus.activeTaskTitle = nextTask.taskTitle;
          employee.liveStatus.activeTaskDescription = nextTask.description || ""; 
          employee.liveStatus.currentTaskCriticality = nextTask.estimatedCriticality;

          newActiveTask = {
            issueId: nextTask.issueId,
            title: nextTask.taskTitle,
            criticality: nextTask.estimatedCriticality
          };
          console.log("🆕 New active task assigned:", newActiveTask);
        } else {
          // Queue is empty, employee is now idle but active
          employee.liveStatus.currentActivity = 'Active'; 
        }
      }

      // 8. CRITICAL: Inform Mongoose that nested objects were modified
      employee.markModified('performance');
      employee.markModified('liveStatus');
      employee.markModified('workload');

      // 9. Save Employee
      await employee.save();
      console.log("💾 Employee updated successfully");
    } else {
      console.log("⚠️ Task saved, but no assigned Employee was found to update.");
    }

    // 10. Return Response
    return res.status(200).json({
      message: "Task completed successfully",
      newActiveTask: newActiveTask
    });

  } catch (error) {
    console.error("🔥 Error marking task as complete:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;


// router.patch('/complete/:id', async (req, res) => {
//   try {
//     const { id: taskId } = req.params;

//     // 1. Validate task ID
//     if (!mongoose.Types.ObjectId.isValid(taskId)) {
//       return res.status(400).json({ error: "Invalid task ID" });
//     }

//     // 2. Find the task
//     const task = await Task.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ error: "Task not found" });
//     }

//     // 3. Update Task status and completion time
//     task.status = "done";
//     task.completedAt = new Date();
//     await task.save();

//     // 4. Find the employee who is currently working on this task
//     const employee = await Employee.findOne({ "liveStatus.activeIssueId": taskId });

//     let newActiveTask = null;

//     if (employee) {
//       // 5. Update employee metrics
//       // a) Increment tasks completed
//       employee.performance.tasksCompleted = (employee.performance.tasksCompleted || 0) + 1;

//       // b) Add to historical record
//       employee.performance.history.push({
//         issueId: taskId,
//         taskTitle: task.title,
//         resolvedAt: new Date()
//       });

//       // c) Clear the now-completed active task fields
//       employee.liveStatus.activeIssueId = null;
//       employee.liveStatus.activeTaskTitle = null;
//       employee.liveStatus.activeTaskDescription = null;
//       employee.liveStatus.currentTaskCriticality = 0;

//       // d) Remove this task from queue if it exists there (safety check)
//       if (employee.workload && employee.workload.taskQueue) {
//         employee.workload.taskQueue = employee.workload.taskQueue.filter(
//           item => item.issueId && item.issueId.toString() !== taskId.toString()
//         );

//         // e) Assign next task from queue if NOT empty
//         if (employee.workload.taskQueue.length > 0) {
//           // Sort queue in descending order of estimatedCriticality
//           employee.workload.taskQueue.sort((a, b) => b.estimatedCriticality - a.estimatedCriticality);

//           // Pick the highest priority task and remove it from queue
//           const nextTask = employee.workload.taskQueue.shift();

//           // Set the next task as active
//           employee.liveStatus.activeIssueId = nextTask.issueId;
//           employee.liveStatus.activeTaskTitle = nextTask.taskTitle;
//           employee.liveStatus.activeTaskDescription = ""; 
//           employee.liveStatus.currentTaskCriticality = nextTask.estimatedCriticality;

//           newActiveTask = {
//             issueId: nextTask.issueId,
//             title: nextTask.taskTitle,
//             criticality: nextTask.estimatedCriticality
//           };
//         }
//       }

//       // 6. Save updated employee document
//       await employee.save();
//     }

//     // 7. Return success response
//     return res.status(200).json({
//       message: "Task completed successfully",
//       newActiveTask: newActiveTask
//     });

//   } catch (error) {
//     console.error("Error marking task as complete:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;
