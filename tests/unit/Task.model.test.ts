import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Task from '../../models/Task';

describe('Task Model Unit Tests (with real DB)', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  it('should require a title', async () => {
    const task = new Task({});
    let err;
    try {
      await task.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect((err).errors.title).toBeDefined();
  });

  it('should not allow empty title', async () => {
    const task = new Task({ title: '' });
    let err;
    try {
      await task.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors.title).toBeDefined();
  });

  it('should allow valid title', async () => {
    const task = new Task({ title: 'Test Task' });
    await expect(task.validate()).resolves.toBeUndefined();
  });

  it('should create and retrieve a task', async () => {
    const task = await Task.create({ title: 'My Task' });
    const found = await Task.findById(task._id);
    expect(found).toBeDefined();
    expect(found.title).toBe('My Task');
    expect(found.completed).toBe(false);
  });

  it('should update a task', async () => {
    const task = await Task.create({ title: 'Old Title' });
    task.title = 'New Title';
    await task.save();
    const found = await Task.findById(task._id);
    expect(found.title).toBe('New Title');
  });

  it('should delete a task', async () => {
    const task = await Task.create({ title: 'To Delete' });
    await Task.findByIdAndDelete(task._id);
    const found = await Task.findById(task._id);
    expect(found).toBeNull();
  });
});

describe('Task Model Unit Tests (with mocking)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should mock Task.create', async () => {
    const mockCreate = jest.spyOn(Task, 'create').mockResolvedValue({ _id: 'mockid', title: 'Mock', completed: false });
    const result = await Task.create({ title: 'Mock' });
    expect(mockCreate).toHaveBeenCalledWith({ title: 'Mock' });
    expect(result.title).toBe('Mock');
    expect(result.completed).toBe(false);
  });

  it('should mock Task.findById', async () => {
    const mockFind = jest.spyOn(Task, 'findById').mockResolvedValue({ _id: 'mockid', title: 'Mock', completed: false });
    const result = await Task.findById('mockid');
    expect(mockFind).toHaveBeenCalledWith('mockid');
    expect(result.title).toBe('Mock');
  });

  it('should mock Task.deleteMany', async () => {
    const mockDelete = jest.spyOn(Task, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
    const result = await Task.deleteMany({});
    expect(mockDelete).toHaveBeenCalled();
    expect(result.deletedCount).toBe(1);
  });
}); 