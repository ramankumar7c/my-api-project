import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let Task: any;
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  Task = (await import('../../models/Task')).default;
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await Task.deleteMany({});
});

describe('Database Integration Tests', () => {
  it('should create multiple tasks and fetch them', async () => {
    await Task.create({ title: 'Task 1' });
    await Task.create({ title: 'Task 2', completed: true });
    const all = await Task.find({});
    expect(all.length).toBe(2);
    expect(all[0].title).toBeDefined();
    expect(all[1].title).toBeDefined();
  });

  it('should update multiple tasks', async () => {
    const t1 = await Task.create({ title: 'A', completed: false });
    const t2 = await Task.create({ title: 'B', completed: false });
    await Task.updateMany({}, { completed: true });
    const updated = await Task.find({ completed: true });
    expect(updated.length).toBe(2);
  });

  it('should delete all tasks', async () => {
    await Task.create({ title: 'A' });
    await Task.create({ title: 'B' });
    await Task.deleteMany({});
    const all = await Task.find({});
    expect(all.length).toBe(0);
  });

  it('should handle invalid ObjectId gracefully', async () => {
    const found = await Task.findById('507f1f77bcf86cd799439011');
    expect(found).toBeNull();
  });

  it('should handle validation error', async () => {
    let err;
    try {
      await Task.create({});
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.name).toBe('ValidationError');
  });
}); 