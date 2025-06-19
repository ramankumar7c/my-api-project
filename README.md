# Task Manager API (Next.js + TypeScript + MongoDB)

## Features
- Custom API with CRUD operations
- MongoDB + Mongoose integration
- Frontend with form to add tasks

## How to Run

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
Create `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
```

### 3. Run locally
```bash
npm run dev
```

## API Endpoints

| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| GET    | /api/tasks       | List all tasks    |
| POST   | /api/tasks       | Create new task   |
| GET    | /api/tasks/:id   | Get task by ID    |
| PUT    | /api/tasks/:id   | Update task       |
| DELETE | /api/tasks/:id   | Delete task       |
