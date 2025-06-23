import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let Task: any;
let dbConnect: any;
let handler: any;
let handlerById: any;
let createMocks: any;
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  dbConnect = (await import('../../lib/dbConnect')).default;
  Task = (await import('../../models/Task')).default;
  handler = (await import('../../pages/api/tasks/index')).default;
  handlerById = (await import('../../pages/api/tasks/[id]')).default;
  createMocks = (await import('node-mocks-http')).createMocks;
  await dbConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await Task.deleteMany({});
});

const createTask = async (title: string, completed = false) => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { title, completed },
  });
  await handler(req, res);
  return res._getJSONData();
};

const getTasks = async () => {
  const { req, res } = createMocks({ method: 'GET' });
  await handler(req, res);
  return res._getJSONData();
};

const getTaskById = async (id: string) => {
  const { req, res } = createMocks({ method: 'GET', query: { id } });
  await handlerById(req, res);
  return res._getJSONData();
};

const updateTask = async (id: string, data: any) => {
  const { req, res } = createMocks({ method: 'PUT', query: { id }, body: data });
  await handlerById(req, res);
  return res._getJSONData();
};

const deleteTask = async (id: string) => {
  const { req, res } = createMocks({ method: 'DELETE', query: { id } });
  await handlerById(req, res);
  return res;
};

describe('API Integration Tests', () => {
  it('should create and fetch a task', async () => {
    const created = await createTask('Integration Task');
    expect(created.title).toBe('Integration Task');
    const tasks = await getTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Integration Task');
  });

  it('should update a task', async () => {
    const created = await createTask('To Update');
    const updated = await updateTask(created._id, { title: 'Updated', completed: true });
    expect(updated.title).toBe('Updated');
    expect(updated.completed).toBe(true);
  });

  it('should delete a task', async () => {
    const created = await createTask('To Delete');
    const res = await deleteTask(created._id);
    expect(res._getStatusCode()).toBe(204);
    const tasks = await getTasks();
    expect(tasks.length).toBe(0);
  });

  it('should handle not found', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '507f1f77bcf86cd799439011' } });
    await handlerById(req, res);
    expect(res._getStatusCode()).toBe(404);
  });
}); 