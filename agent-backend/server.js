require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Employee = require('./models/Employee');
const apiRoutes = require('./routes/api');
const taskRoutes = require('./routes/task');


const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use('/api', apiRoutes);
app.use('/api/task', taskRoutes);



// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🚀 MAIN WEBHOOK ENDPOINT
app.post('/api/assign-task', async (req, res) => {
    try {
        const { taskContext, domain, priority } = req.body;

        // 1. Validate input
        if (!taskContext) {
            return res.status(400).json({ error: "Missing 'taskContext'" });
        }

        // 2. Fetch employees
        const availableEmployees = await Employee.find({
            "liveStatus.isPresentToday": true
        });

        if (availableEmployees.length === 0) {
            return res.status(404).json({
                error: "No employees are currently clocked in."
            });
        }

        // 3. Prepare AI Prompt
        const prompt = `
You are an elite AI Project Manager routing tasks.

Rules:
1. Skip employees with criticality 8-10 unless emergency
2. Match resolvedTags with task
3. Match domain/sector
4. Choose lowest workloadScore

Return ONLY JSON:
{
  "employeeId": "ID",
  "employeeName": "Name",
  "assignedTaskSummary": "3-5 words",
  "reasoning": "1 sentence",
  "action": { "increaseTotalPendingTasks": 1, "workloadScoreIncrease": 5 }
}

TASK:
Context: ${taskContext}
Domain: ${domain || "Any"}
Priority: ${priority || "Normal"}

EMPLOYEES:
${JSON.stringify(availableEmployees)}
`;

        // 4. Call Gemini
        console.log("🧠 Asking Gemini...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);

        let aiText = result.response.text()
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        // Safe JSON parse
        let parsedData;
        try {
            parsedData = JSON.parse(aiText);
        } catch (err) {
            console.error("❌ Invalid AI JSON:", aiText);
            return res.status(500).json({
                error: "AI response parsing failed"
            });
        }

        // 5. Find selected employee
        const targetEmployee = availableEmployees.find(
            e => e.employeeId === parsedData.employeeId
        );

        if (!targetEmployee) {
            return res.status(500).json({
                error: "AI selected invalid employee"
            });
        }

        let currentQueue = targetEmployee.assignedWork.taskQueue || [];
        const nonTaskStates = ["On Lunch Break", "Offline", "None", null, ""];

        // Push current task if busy
        if (
            targetEmployee.liveStatus.activeTaskTitle &&
            !nonTaskStates.includes(targetEmployee.liveStatus.activeTaskTitle)
        ) {
            currentQueue.push({
                taskTitle: targetEmployee.liveStatus.activeTaskTitle,
                estimatedCriticality:
                    targetEmployee.liveStatus.currentTaskCriticality,
            });
        }

        // 6. Update workload
        const newTotalTasks =
            targetEmployee.assignedWork.totalPendingTasks +
            parsedData.action.increaseTotalPendingTasks;

        const newWorkloadScore =
            targetEmployee.assignedWork.workloadScore +
            parsedData.action.workloadScoreIncrease;

        // 7. Save to DB
        await Employee.findOneAndUpdate(
            { employeeId: parsedData.employeeId },
            {
                $set: {
                    "assignedWork.totalPendingTasks": newTotalTasks,
                    "assignedWork.workloadScore": newWorkloadScore,
                    "assignedWork.taskQueue": currentQueue,
                    "liveStatus.activeTaskTitle":
                        parsedData.assignedTaskSummary,
                    "liveStatus.currentTaskCriticality":
                        priority === "Critical" ? 10 : 5,
                    "latestAiReasoning": parsedData.reasoning,
                },
            }
        );

        console.log(`✅ Assigned to ${parsedData.employeeName}`);

        // 8. Response
        res.status(200).json({
            status: "Success",
            assignedTo: parsedData.employeeName,
            summary: parsedData.assignedTaskSummary,
            aiReasoning: parsedData.reasoning,
        });

    } catch (error) {
        console.error("🚨 Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🚀 Start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("🟢 MongoDB Connected");
        app.listen(process.env.PORT || 3000, () =>
            console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
        );
    })
    .catch(err => console.error("🔴 DB Error:", err));