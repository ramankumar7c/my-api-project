import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      const tasks = await Task.find({}).sort({ createdAt: -1 });
      return res.status(200).json(tasks);
    }

    if (req.method === 'POST') {
      const { title } = req.body;
      
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Title is required and must be a non-empty string' 
        });
      }

      const task = await Task.create({ 
        title: title.trim(),
        completed: false 
      });
      return res.status(201).json(task);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
