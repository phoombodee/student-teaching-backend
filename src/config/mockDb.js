// Simple in-memory database for development/testing
// This file replaces MongoDB when it's not available

let db = {
  reports: [
    {
      _id: '1',
      weekId: 1,
      label: 'Week 1',
      dates: 'April 20 – April 26',
      title: 'Project Introduction',
      status: 'done',
      days: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      weekId: 2,
      label: 'Week 2',
      dates: 'April 27 – May 3',
      title: 'Foundation Building',
      status: 'done',
      days: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '3',
      weekId: 3,
      label: 'Week 3',
      dates: 'May 4 – May 10',
      title: 'Frontend Development',
      status: 'inprogress',
      days: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '4',
      weekId: 4,
      label: 'Week 4',
      dates: 'May 11 – May 17',
      title: 'API & Database',
      status: 'todo',
      days: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '5',
      weekId: 5,
      label: 'Week 5',
      dates: 'May 18 – May 24',
      title: 'Feature Enhancement',
      status: 'todo',
      days: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '6',
      weekId: 6,
      label: 'Week 6',
      dates: 'May 25 – May 31',
      title: 'Optimization',
      status: 'todo',
      days: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '7',
      weekId: 7,
      label: 'Week 7',
      dates: 'June 1 – June 7',
      title: 'Final Stretch',
      status: 'todo',
      days: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

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
  console.log('✓ Using in-memory database (MongoDB not available)');
  console.log('  Note: Data will be lost on server restart');
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
    const updated = { ...db.reports[index], ...data, updatedAt: new Date() };
    db.reports[index] = updated;
    return updated;
  }

  static async findByIdAndDelete(id) {
    const index = db.reports.findIndex(r => r._id === id);
    if (index === -1) return null;
    const deleted = db.reports[index];
    db.reports.splice(index, 1);
    return deleted;
  }

  static async insertMany(data) {
    const withIds = data.map((item, i) => ({
      ...item,
      _id: String(i + 1),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    db.reports = withIds;
    return withIds;
  }

  static async countDocuments() {
    return db.reports.length;
  }

  constructor(data) {
    this._id = String(Date.now());
    this.weekId = data.weekId;
    this.label = data.label;
    this.title = data.title;
    this.dates = data.dates;
    this.status = data.status || 'todo';
    this.days = data.days || [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    db.reports.push(this);
    return this;
  }
}

module.exports = { connectDB, WeeklyReport };
