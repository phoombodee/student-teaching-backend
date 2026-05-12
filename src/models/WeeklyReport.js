const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  }
}, { _id: false });

const daySchema = new mongoose.Schema({
  dayName: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true
  },
  tasks: [{
    type: String
  }],
  notes: {
    type: String,
    default: ''
  },
  images: [imageSchema]
}, { _id: false });

const weeklyReportSchema = new mongoose.Schema({
  weekId: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  dates: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'inprogress', 'done'],
    default: 'todo'
  },
  days: [daySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
weeklyReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
