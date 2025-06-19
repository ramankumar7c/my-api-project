import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    const task = await Task.findById(id);
    return res.status(200).json(task);
  }

  if (req.method === 'PUT') {
    const task = await Task.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json(task);
  }

  if (req.method === 'DELETE') {
    await Task.findByIdAndDelete(id);
    return res.status(204).end();
  }

  res.status(405).end();
}
