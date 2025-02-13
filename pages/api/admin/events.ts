import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Encoding', 'none');

  // Function to send SSE data
  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 30000);

  // Clean up on close
  res.on('close', () => {
    clearInterval(keepAlive);
    res.end();
  });

  // Send initial connection established event
  sendEvent({ type: 'connected' });

  // Keep the connection open
  req.on('close', () => {
    clearInterval(keepAlive);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
