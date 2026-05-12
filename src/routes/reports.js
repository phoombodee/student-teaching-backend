const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const upload = require('../middleware/upload');

// GET all reports
router.get('/reports', reportController.getAllReports);

// GET single report
router.get('/reports/:id', reportController.getReportById);

// CREATE new report
router.post('/reports', reportController.createReport);

// UPDATE report
router.put('/reports/:id', reportController.updateReport);

// DELETE report
router.delete('/reports/:id', reportController.deleteReport);

// UPDATE specific day in a report
router.put('/reports/:id/days/:dayName', reportController.updateDay);

// UPLOAD image (will add image to day)
router.post('/reports/:id/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const imageData = {
      id: Date.now() + Math.random(),
      name: req.file.originalname,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    };

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: imageData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

module.exports = router;
