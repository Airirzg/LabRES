import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/utils/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (typeof id !== 'string' || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    // Update reservation status
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        equipment: true,
      },
    });

    // Send email notification to user
    const emailSubject = `Reservation ${status.toLowerCase()} for ${reservation.equipment.name}`;
    const emailContent = `
      Dear ${reservation.user.name},

      Your reservation for ${reservation.equipment.name} has been ${status.toLowerCase()}.

      Details:
      - Equipment: ${reservation.equipment.name}
      - Start Time: ${new Date(reservation.startTime).toLocaleString()}
      - End Time: ${new Date(reservation.endTime).toLocaleString()}
      ${status === 'REJECTED' ? '\nPlease feel free to submit another reservation request.' : ''}

      Best regards,
      LabRES Team
    `;

    await sendEmail({
      to: reservation.user.email,
      subject: emailSubject,
      text: emailContent,
    });

    // Also create a notification in the database
    await prisma.notification.create({
      data: {
        userId: reservation.userId,
        title: emailSubject,
        content: emailContent,
        type: 'RESERVATION_STATUS',
        read: false,
      },
    });

    return res.status(200).json(reservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
