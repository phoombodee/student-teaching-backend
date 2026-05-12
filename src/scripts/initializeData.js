const mongoose = require('mongoose');
require('dotenv').config();
const WeeklyReport = require('../src/models/WeeklyReport');
const connectDB = require('../src/config/database');

const defaultWeeks = [
  {
    weekId: 1,
    label: 'Week 1',
    dates: 'April 20 – April 26',
    title: 'Project Introduction',
    status: 'done',
    days: []
  },
  {
    weekId: 2,
    label: 'Week 2',
    dates: 'April 27 – May 3',
    title: 'Foundation Building',
    status: 'done',
    days: []
  },
  {
    weekId: 3,
    label: 'Week 3',
    dates: 'May 4 – May 10',
    title: 'Frontend Development',
    status: 'inprogress',
    days: []
  },
  {
    weekId: 4,
    label: 'Week 4',
    dates: 'May 11 – May 17',
    title: 'API & Database',
    status: 'todo',
    days: []
  },
  {
    weekId: 5,
    label: 'Week 5',
    dates: 'May 18 – May 24',
    title: 'Feature Enhancement',
    status: 'todo',
    days: []
  },
  {
    weekId: 6,
    label: 'Week 6',
    dates: 'May 25 – May 31',
    title: 'Optimization',
    status: 'todo',
    days: []
  },
  {
    weekId: 7,
    label: 'Week 7',
    dates: 'June 1 – June 7',
    title: 'Final Stretch',
    status: 'todo',
    days: []
  }
];

const initializeDatabase = async () => {
  try {
    await connectDB();
    
    // Check if data already exists
    const existingCount = await WeeklyReport.countDocuments();
    if (existingCount > 0) {
      console.log(`✓ Database already has ${existingCount} reports. Skipping initialization.`);
      process.exit(0);
    }
    
    // Insert default weeks
    const result = await WeeklyReport.insertMany(defaultWeeks);
    console.log(`✓ Successfully initialized ${result.length} default weeks`);
    console.log('\nWeeks created:');
    result.forEach(week => {
      console.log(`  - ${week.label}: ${week.title}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();
