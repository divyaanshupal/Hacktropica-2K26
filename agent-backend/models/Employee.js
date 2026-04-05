// const mongoose = require('mongoose');

// const EmployeeSchema = new mongoose.Schema({
//   employeeId: { 
//     type: String, 
//     required: true, 
//     unique: true 
//   },
//   name: { 
//     type: String, 
//     required: true 
//   },
//   sector: {
//     type: String,
//     enum: ['ML', 'SDE', 'Security', 'DevOps'],
//     required: true
//   },
  
//   // --- REAL-TIME AVAILABILITY & TASK TRACKING ---
//   liveStatus: {
//     isPresentToday: { type: Boolean, default: false },
//     currentActivity: {
//       type: String,
//       enum: ['Active', 'Lunch', 'InMeeting', 'DeepWork', 'Offline'],
//       default: 'Offline'
//     },
//     expectedReturnTime: { type: Date, default: null },
//    // Are they currently fighting a massive fire? (Scale 0-10)
//     // 0 = None, 1-3 = Low, 4-7 = High, 8-10 = Do Not Disturb
//     currentTaskCriticality: {
//       type: Number,
//       min: 0,
//       max: 10, 
//       default: 0
//     },
//     // The link to the database object
//     activeIssueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
//     // NEW: Human/AI readable fields so the Agent instantly knows what they are doing
//     activeTaskTitle: { type: String, default: null },
//     activeTaskDescription: { type: String, default: null }
//   },

//  // --- WORKLOAD MANAGEMENT & SMART QUEUE ---
//   assignedWork: {
//     totalPendingTasks: { type: Number, default: 0 },
//     workloadScore: { type: Number, default: 0 }, 
    
//     // NEW: The Smart Queue! 
//     // Instead of just IDs, we store what the task actually is so it doesn't get lost.
//     taskQueue: [{
//       issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
//       taskTitle: { type: String, required: true },
//       estimatedCriticality: { type: Number, default: 0 },
//       addedToQueueAt: { type: Date, default: Date.now }
//     }]
//   },

//   // --- HISTORICAL EXPERTISE ---
//   pastExperience: {
//     totalResolved: { type: Number, default: 0 },
//     resolvedTags: [{ type: String }], 
//     history: [{
//       issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
//       resolvedAt: { type: Date }
//     }]
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Employee', EmployeeSchema);


//-----------------------------new


const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  // --- IDENTITY & ORG STRUCTURE ---
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true }, //.
  email: { type: String, required: true, unique: true },
  sector: {type:String, enum: ['AI & Machine Learning',
      'Cybersecurity',
      'Backend Developer',
      'Frontend Developer',
      'DevOps',
      'Cloud'],required: true},
  experienceLevel: {
    type: String,
    enum: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'],
    default: 'Mid'
  },

  // --- EXPERTISE & SKILLS ---
  expertise: {
    skills: [{ type: String , 
            enum: [
      'AI & Machine Learning',
      'Cybersecurity',
      'Backend Developer',
      'Frontend Developer',
      'DevOps',
      'Cloud'
    ]
      }],
    
    // e.g., ["nodejs", "payments", "mongodb"] //.
    // Using a Map allows dynamic skill keys (e.g., { "payments": 0.9, "auth": 0.6 })
    skillScores: { 
      type: Map, 
      of: Number, 
      default: {} 
    }
  },

  // --- REAL-TIME AVAILABILITY (The "Dispatcher") ---
  liveStatus: {
    isPresentToday: { type: Boolean, default: false },
    currentActivity: {
      type: String,
      enum: ['Active', 'Lunch', 'InMeeting', 'DeepWork', 'Offline'],
      default: 'Offline'
    },
    expectedReturnTime: { type: Date, default: null },
    // Criticality of current task (0 = Idle/None, 10 = System Outage)
    currentTaskCriticality: { type: Number, min: 0, max: 10, default: 0 }, //.
    
    // Rich context for the current task so AI agents don't have to populate()
    activeIssueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
    activeTaskTitle: { type: String, default: null }, //.
    activeTaskDescription: { type: String, default: null },
    
    // Track active meetings to prevent interruptions
    currentMeetingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }]
  },

  // --- WORKLOAD & SMART QUEUE ---
  workload: {
    capacity: { type: Number, default: 5 }, // Max comfortable tasks
    activeTasksCount: { type: Number, default: 0 },
    workloadScore: { type: Number, default: 0 }, // AI-calculated stress/load score
    
    // The Smart Queue: Rich objects instead of just IDs
    taskQueue: [{
      issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
      taskTitle: { type: String, required: true },
      estimatedCriticality: { type: Number, default: 0 },
      addedToQueueAt: { type: Date, default: Date.now }
    }]
  },

  // --- PERFORMANCE & HISTORICAL DATA (The "Profiler") ---
  performance: {
    tasksCompleted: { type: Number, default: 0 },
    // Stored in hours (Number) for database aggregations/math, rather than a string "3h"
    avgResolutionTimeHours: { type: Number, default: 0 }, 
    bugFixSuccessRate: { type: Number, min: 0, max: 1, default: 1.0 },
    
    // Frequently resolved domains for fast routing
    resolvedTags: [{ type: String }], //.
    
    // Historical log of completed work
    history: [{
      issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
      taskTitle: { type: String },
      resolvedAt: { type: Date, default: Date.now }
    }]
  }

}, { 
  timestamps: true // Automatically handles createdAt and updatedAt
});

// INDEXES for fast querying by an AI Dispatcher
EmployeeSchema.index({ "liveStatus.currentActivity": 1, "workload.workloadScore": 1 });
EmployeeSchema.index({ "expertise.skills": 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);