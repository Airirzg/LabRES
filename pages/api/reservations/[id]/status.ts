import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // TODO: Update the reservation status in your database
    // const updatedReservation = await prisma.reservation.update({
    //   where: { id: String(id) },
    //   data: { status }
    // });

    // For now, return mock data
    const updatedReservation = {
      id: String(id),
      status,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
}

export default withAuth(handler);
