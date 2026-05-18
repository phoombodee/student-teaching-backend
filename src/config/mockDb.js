// File-based database for development/testing when MongoDB is unavailable
// Data is persisted to data/db.json file

const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');
const dbFilePath = path.join(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default initial data
const defaultData = {
  reports: [
    {
      _id: '1',
      weekId: 1,
      label: 'Week 1',
      dates: 'April 20 – April 26',
      title: 'Project Introduction',
      status: 'done',
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      weekId: 2,
      label: 'Week 2',
      dates: 'April 27 – May 3',
      title: 'Foundation Building',
      status: 'done',
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '3',
      weekId: 3,
      label: 'Week 3',
      dates: 'May 4 – May 10',
      title: 'Frontend Development',
      status: 'inprogress',
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '4',
      weekId: 4,
      label: 'Week 4',
      dates: 'May 11 – May 17',
      title: 'API & Database',
      status: 'todo',
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '5',
      weekId: 5,
      label: 'Week 5',
      dates: 'May 18 – May 24',
      title: 'Feature Enhancement',
      status: 'todo',
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '6',
      weekId: 6,
      label: 'Week 6',
      dates: 'May 25 – May 31',
      title: 'Optimization',
      status: 'todo',
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '7',
      weekId: 7,
      label: 'Week 7',
      dates: 'June 1 – June 7',
      title: 'Final Stretch',
      status: 'todo',
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Load data from file or create default
let db = null;

function loadDatabase() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const fileContent = fs.readFileSync(dbFilePath, 'utf-8');
      db = JSON.parse(fileContent);
      console.log('✓ Database loaded from file: data/db.json');
    } else {
      db = JSON.parse(JSON.stringify(defaultData)); // Deep copy
      saveDatabase();
      console.log('✓ Database initialized with default data');
    }
  } catch (error) {
    console.error('Error loading database, using defaults:', error.message);
    db = JSON.parse(JSON.stringify(defaultData));
  }
  return db;
}

function saveDatabase() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error.message);
  }
}

// Initialize on module load
loadDatabase();

// Query builder with chainable methods
class QueryBuilder {
  constructor(data) {
    this.data = data;
  }

  sort(fields) {
    const fieldName = typeof fields === 'string' ? fields : Object.keys(fields)[0];
    const sortOrder = typeof fields === 'object' && fields[fieldName] === -1 ? -1 : 1;
    
    this.data.sort((a, b) => {
      if (a[fieldName] < b[fieldName]) return -1 * sortOrder;
      if (a[fieldName] > b[fieldName]) return 1 * sortOrder;
      return 0;
    });
    
    return this;
  }

  // Support both await and direct access
  async catch() {
    return this.data;
  }

  // Make it thenable for await
  then(resolve, reject) {
    try {
      resolve(this.data);
    } catch (error) {
      if (reject) reject(error);
    }
  }
}

// Simulate MongoDB connection
const connectDB = async () => {
  console.log('✓ Using file-based database (MongoDB not available)');
  console.log('  Data persisted to: data/db.json');
  return true;
};

// Simulate Mongoose Model - WeeklyReport
class WeeklyReport {
  static find() {
    return new QueryBuilder([...db.reports]);
  }

  static async findById(id) {
    return db.reports.find(r => r._id === id) || null;
  }

  static async findByIdAndUpdate(id, data) {
    const index = db.reports.findIndex(r => r._id === id);
    if (index === -1) return null;
    const updated = { 
      ...db.reports[index], 
      ...data, 
      updatedAt: new Date().toISOString() 
    };
    db.reports[index] = updated;
    saveDatabase();
    return updated;
  }

  static async findByIdAndDelete(id) {
    const index = db.reports.findIndex(r => r._id === id);
    if (index === -1) return null;
    const deleted = db.reports[index];
    db.reports.splice(index, 1);
    saveDatabase();
    return deleted;
  }

  static async insertMany(data) {
    const withIds = data.map((item, i) => ({
      ...item,
      _id: String(i + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    db.reports = withIds;
    saveDatabase();
    return withIds;
  }

  static async countDocuments() {
    return db.reports.length;
  }

  constructor(data) {
    this._id = String(Date.now() + Math.random());
    this.weekId = data.weekId;
    this.label = data.label;
    this.title = data.title;
    this.dates = data.dates;
    this.status = data.status || 'todo';
    this.days = data.days || [];
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  async save() {
    db.reports.push(this);
    saveDatabase();
    return this;
  }

  toObject() {
    return {
      _id: this._id,
      weekId: this.weekId,
      label: this.label,
      title: this.title,
      dates: this.dates,
      status: this.status,
      days: this.days,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = { connectDB, WeeklyReport };
