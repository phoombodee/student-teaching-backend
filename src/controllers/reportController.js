const WeeklyReport = require('../models/WeeklyReport');
const { WeeklyReport: MockWeeklyReport } = require('../config/mockDb');
const { useMockDatabase } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Helper: Convert days object to array format for storage
const convertDaysToArray = (daysInput) => {
  if (!daysInput) return [];
  
  // If already an array, return as is
  if (Array.isArray(daysInput)) return daysInput;
  
  // If object, convert to array
  if (typeof daysInput === 'object') {
    return Object.entries(daysInput).map(([dayName, dayData]) => ({
      dayName,
      tasks: dayData.tasks || [],
      notes: dayData.notes || '',
      images: dayData.images || []
    }));
  }
  
  return [];
};

// Helper: Convert days array to object format for response
const convertDaysToObject = (daysArray) => {
  if (!Array.isArray(daysArray)) return {};
  
  const daysObj = {};
  daysArray.forEach(day => {
    daysObj[day.dayName] = {
      tasks: day.tasks || [],
      notes: day.notes || '',
      images: day.images || []
    };
  });
  return daysObj;
};

// GET all weekly reports
exports.getAllReports = async (req, res) => {
  try {
    const isMockDB = useMockDatabase();
    
    let reports;
    if (isMockDB) {
      // For mock DB, get data and sort manually
      reports = await MockWeeklyReport.find();
      reports = reports.sort((a, b) => a.weekId - b.weekId);
    } else {
      // For real MongoDB
      reports = await WeeklyReport.find().sort({ weekId: 1 });
    }
    
    // Convert all reports to object format for frontend
    const formattedReports = reports.map(report => ({
      ...report.toObject ? report.toObject() : report,
      days: convertDaysToObject(report.days || [])
    }));
    
    res.status(200).json({
      success: true,
      data: formattedReports
    });
  } catch (error) {
    console.error('Error in getAllReports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

// GET single weekly report by ID
exports.getReportById = async (req, res) => {
  try {
    const isMockDB = useMockDatabase();
    
    let report;
    if (isMockDB) {
      report = await MockWeeklyReport.findById(req.params.id);
    } else {
      report = await WeeklyReport.findById(req.params.id);
    }
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Convert response to object format for frontend
    const responseData = {
      ...report.toObject ? report.toObject() : report,
      days: convertDaysToObject(report.days || [])
    };
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error in getReportById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

// CREATE new weekly report
exports.createReport = async (req, res) => {
  try {
    const isMockDB = useMockDatabase();
    const { weekId, label, title, dates, status, days } = req.body;
    
    // Validate required fields
    if (!weekId || !label || !title || !dates) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: weekId, label, title, dates'
      });
    }
    
    // Convert days to array format for storage
    const daysArray = convertDaysToArray(days);
    
    let report;
    if (isMockDB) {
      report = new MockWeeklyReport({
        weekId,
        label,
        title,
        dates,
        status: status || 'todo',
        days: daysArray
      });
    } else {
      report = new WeeklyReport({
        weekId,
        label,
        title,
        dates,
        status: status || 'todo',
        days: daysArray
      });
    }
    
    await report.save();
    
    // Convert response back to object format for frontend
    const responseData = {
      ...report.toObject ? report.toObject() : report,
      days: convertDaysToObject(report.days || [])
    };
    
    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error in createReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

// UPDATE weekly report
exports.updateReport = async (req, res) => {
  try {
    const isMockDB = useMockDatabase();
    const { id } = req.params;
    const { weekId, label, title, dates, status, days } = req.body;
    
    // Convert days object to array for storage
    const daysArray = convertDaysToArray(days);
    
    let report;
    if (isMockDB) {
      report = await MockWeeklyReport.findByIdAndUpdate(
        id,
        {
          weekId,
          label,
          title,
          dates,
          status,
          days: daysArray,
          updatedAt: new Date()
        }
      );
    } else {
      report = await WeeklyReport.findByIdAndUpdate(
        id,
        {
          weekId,
          label,
          title,
          dates,
          status,
          days: daysArray,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
    }
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Convert response back to object format for frontend
    const responseData = {
      ...report.toObject ? report.toObject() : report,
      days: convertDaysToObject(report.days || [])
    };
    
    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error in updateReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

// DELETE weekly report
exports.deleteReport = async (req, res) => {
  try {
    const isMockDB = useMockDatabase();
    const { id } = req.params;
    
    let report;
    if (isMockDB) {
      report = await MockWeeklyReport.findByIdAndDelete(id);
    } else {
      report = await WeeklyReport.findByIdAndDelete(id);
    }
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Delete associated image files
    if (report.days && report.days.length > 0) {
      report.days.forEach(day => {
        if (day.images && day.images.length > 0) {
          day.images.forEach(image => {
            const filePath = path.join(__dirname, '../../uploads', image.filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: report
    });
  } catch (error) {
    console.error('Error in deleteReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

// UPDATE day in a report
exports.updateDay = async (req, res) => {
  try {
    const isMockDB = useMockDatabase();
    const { id, dayName } = req.params;
    const { tasks, notes, images } = req.body;
    
    let report;
    if (isMockDB) {
      // Get current report
      report = await MockWeeklyReport.findById(id);
    } else {
      report = await WeeklyReport.findById(id);
    }
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Ensure days is array
    if (!Array.isArray(report.days)) {
      report.days = [];
    }
    
    // Find and update the day
    const dayIndex = report.days.findIndex(d => d.dayName === dayName);
    
    if (dayIndex !== -1) {
      report.days[dayIndex] = {
        dayName,
        tasks: tasks || [],
        notes: notes || '',
        images: images || []
      };
    } else {
      // Create new day entry if not exists
      report.days.push({
        dayName,
        tasks: tasks || [],
        notes: notes || '',
        images: images || []
      });
    }
    
    // Update and save
    if (isMockDB) {
      // Use findByIdAndUpdate for mock DB to persist changes
      report = await MockWeeklyReport.findByIdAndUpdate(id, {
        days: report.days,
        updatedAt: new Date().toISOString()
      });
    } else {
      report.updatedAt = new Date();
      await report.save();
    }
    
    // Convert response to object format for frontend
    const responseData = {
      ...report.toObject ? report.toObject() : report,
      days: convertDaysToObject(report.days || [])
    };
    
    res.status(200).json({
      success: true,
      message: 'Day updated successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error in updateDay:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating day',
      error: error.message
    });
  }
};
