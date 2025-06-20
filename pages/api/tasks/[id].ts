import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    if (req.method === 'GET') {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json(task);
    }

    if (req.method === 'PUT') {
      const { title, completed } = req.body;
      
      // Validate input
      if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
        return res.status(400).json({ 
          error: 'Title must be a non-empty string' 
        });
      }

      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ 
          error: 'Completed must be a boolean value' 
        });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title.trim();
      if (completed !== undefined) updateData.completed = completed;

      const task = await Task.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.status(200).json(task);
    }

    if (req.method === 'DELETE') {
      const task = await Task.findByIdAndDelete(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
