import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';

    // Calculate skip value for pagination
    const skip = page * limit;

    // Build the where clause for search and filter
    const where = {
      AND: [
        search
          ? {
              OR: [
                { subject: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { senderName: { contains: search, mode: 'insensitive' } },
                { senderEmail: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        status ? { status } : {},
      ],
    };

    // Get total count for pagination
    const total = await prisma.message.count({ where });

    // Get messages with pagination, search, and filter
    const messages = await prisma.message.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      items: messages,
      totalPages,
      currentPage: page,
      totalItems: total,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
