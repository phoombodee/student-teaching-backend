# Student Teaching Backend API

Express.js + MongoDB API for storing weekly work reports from the MyJob page.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Edit `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-teaching
NODE_ENV=development
```

### 3. MongoDB Setup
Make sure MongoDB is running locally or update `MONGODB_URI` to your MongoDB Atlas connection string.

### 4. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Get All Weekly Reports
```
GET /api/reports
```
Returns all weekly reports sorted by weekId.

### Get Single Report
```
GET /api/reports/:id
```
Returns a specific weekly report by MongoDB ID.

### Create New Report
```
POST /api/reports
Content-Type: application/json

{
  "weekId": 1,
  "label": "Week 1",
  "title": "Project Introduction",
  "dates": "April 20 – April 26",
  "status": "todo",
  "days": []
}
```

### Update Report
```
PUT /api/reports/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "inprogress",
  "days": [...]
}
```

### Delete Report
```
DELETE /api/reports/:id
```
Deletes report and all associated image files.

### Update Specific Day
```
PUT /api/reports/:id/days/:dayName
Content-Type: application/json

{
  "tasks": ["Task 1", "Task 2"],
  "notes": "Completed frontend setup. Encountered issue with CSS grid.",
  "images": [
    {
      "id": "123456",
      "name": "screenshot.png",
      "filename": "screenshot-123456.png",
      "path": "/uploads/screenshot-123456.png"
    }
  ]
}
```

### Upload Image
```
POST /api/reports/:id/upload
Content-Type: multipart/form-data

file: <image file>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "1234567890.123",
    "name": "photo.jpg",
    "filename": "photo-1234567890.jpg",
    "path": "/uploads/photo-1234567890.jpg"
  }
}
```

## Data Structure

### Weekly Report Schema
```javascript
{
  _id: ObjectId,
  weekId: Number,
  label: String,           // e.g. "Week 1"
  title: String,           // e.g. "Project Introduction"
  dates: String,           // e.g. "April 20 – April 26"
  status: String,          // 'todo' | 'inprogress' | 'done'
  days: [
    {
      dayName: String,     // 'Monday' | 'Tuesday' | ... | 'Friday'
      tasks: [String],     // Array of activity descriptions
      notes: String,       // Problems, obstacles, reflections
      images: [
        {
          id: String,
          name: String,    // Original filename
          filename: String, // Saved filename
          path: String     // URL path to access image
        }
      ]
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Image Storage
- Images are stored in `/backend/uploads/` directory
- Accessible via `http://localhost:5000/uploads/<filename>`
- Max file size: 5MB
- Allowed formats: JPEG, PNG, GIF, WebP

## File Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   └── reportController.js # Business logic
│   ├── middleware/
│   │   └── upload.js          # File upload handler
│   ├── models/
│   │   └── WeeklyReport.js    # Mongoose schema
│   ├── routes/
│   │   └── reports.js         # API routes
│   └── server.js              # Express app setup
├── uploads/                   # Uploaded image files
├── .env                       # Environment variables
├── package.json
└── README.md
```

## Notes
- MongoDB ObjectId is automatically generated for each report
- Images are stored as files on disk, with metadata in MongoDB
- All timestamps are automatically managed
- CORS is configured for localhost:3000 (React frontend)
