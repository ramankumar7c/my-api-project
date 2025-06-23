import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Inline helpers
function validateTaskStructure(task: any): boolean {
  return (
    typeof task === 'object' &&
    task !== null &&
    typeof task._id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
}

function validateErrorResponse(error: any): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof error.error === 'string'
  );
}

const mockTaskData = {
  validTask: { title: 'Valid Test Task' },
  invalidTask: { title: '' },
  taskWithCompleted: { title: 'Task with completed', completed: true },
  longTitle: { title: 'A'.repeat(1000) },
  specialCharacters: { title: 'Task with special chars: !@#$%^&*()' },
};

describe('Tasks API End-to-End Tests', () => {
  let createdTaskIds: string[] = [];

  afterEach(async () => {
    // Clean up created tasks after each test
    for (const id of createdTaskIds) {
      try {
        await axios.delete(API_ENDPOINTS.TASK_BY_ID(id));
      } catch {}
    }
    createdTaskIds = [];
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const response = await axios.post(API_ENDPOINTS.TASKS, mockTaskData.validTask);
      expect(response.status).toBe(201);
      expect(validateTaskStructure(response.data)).toBe(true);
      expect(response.data.title).toBe(mockTaskData.validTask.title);
      expect(response.data.completed).toBe(false);
      createdTaskIds.push(response.data._id);
    });

    it('should return 400 for missing title', async () => {
      try {
        await axios.post(API_ENDPOINTS.TASKS, {});
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(validateErrorResponse(error.response.data)).toBe(true);
        expect(error.response.data.error).toBe('Title is required and must be a non-empty string');
      }
    });

    it('should return 400 for empty title', async () => {
      try {
        await axios.post(API_ENDPOINTS.TASKS, mockTaskData.invalidTask);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(validateErrorResponse(error.response.data)).toBe(true);
        expect(error.response.data.error).toBe('Title is required and must be a non-empty string');
      }
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      // Create a task first
      const createResponse = await axios.post(API_ENDPOINTS.TASKS, mockTaskData.validTask);
      createdTaskIds.push(createResponse.data._id);
      const response = await axios.get(API_ENDPOINTS.TASKS);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(validateTaskStructure(response.data[0])).toBe(true);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by id', async () => {
      const createResponse = await axios.post(API_ENDPOINTS.TASKS, mockTaskData.validTask);
      const id = createResponse.data._id;
      createdTaskIds.push(id);
      const response = await axios.get(API_ENDPOINTS.TASK_BY_ID(id));
      expect(response.status).toBe(200);
      expect(validateTaskStructure(response.data)).toBe(true);
      expect(response.data._id).toBe(id);
    });

    it('should return 404 for non-existent id', async () => {
      try {
        await axios.get(API_ENDPOINTS.TASK_BY_ID('507f1f77bcf86cd799439011'));
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(validateErrorResponse(error.response.data)).toBe(true);
        expect(error.response.data.error).toBe('Task not found');
      }
    });

    it('should return 400 for invalid id', async () => {
      try {
        await axios.get(API_ENDPOINTS.TASK_BY_ID('invalid-id'));
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(validateErrorResponse(error.response.data)).toBe(true);
        expect(error.response.data.error).toBe('Invalid task ID format');
      }
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const createResponse = await axios.post(API_ENDPOINTS.TASKS, mockTaskData.validTask);
      const id = createResponse.data._id;
      createdTaskIds.push(id);
      const update = { title: 'Updated Title', completed: true };
      const response = await axios.put(API_ENDPOINTS.TASK_BY_ID(id), update);
      expect(response.status).toBe(200);
      expect(response.data.title).toBe('Updated Title');
      expect(response.data.completed).toBe(true);
    });

    it('should return 400 for empty title', async () => {
      const createResponse = await axios.post(API_ENDPOINTS.TASKS, mockTaskData.validTask);
      const id = createResponse.data._id;
      createdTaskIds.push(id);
      try {
        await axios.put(API_ENDPOINTS.TASK_BY_ID(id), { title: '' });
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(validateErrorResponse(error.response.data)).toBe(true);
        expect(error.response.data.error).toBe('Title must be a non-empty string');
      }
    });

    it('should return 404 for non-existent id', async () => {
      try {
        await axios.put(API_ENDPOINTS.TASK_BY_ID('507f1f77bcf86cd799439011'), { title: 'Updated' });
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(validateErrorResponse(error.response.data)).toBe(true);
        expect(error.response.data.error).toBe('Task not found');
      }
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createResponse = await axios.post(API_ENDPOINTS.TASKS, mockTaskData.validTask);
      const id = createResponse.data._id;
      const response = await axios.delete(API_ENDPOINTS.TASK_BY_ID(id));
      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent id', async () => {
      try {
        await axios.delete(API_ENDPOINTS.TASK_BY_ID('507f1f77bcf86cd799439011'));
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(validateErrorResponse(error.response.data)).toBe(true);
        expect(error.response.data.error).toBe('Task not found');
      }
    });
  });
}); 