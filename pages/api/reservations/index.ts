import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock users data
const users = [
  { id: 'user-1', name: 'John Doe' },
  { id: 'team-1', name: 'Research Team' },
];

// Mock equipment data
const equipment = [
  { id: '1', name: 'Microscope XR-500' },
  { id: '2', name: 'Centrifuge Pro' },
  { id: '3', name: 'Spectrophotometer' },
];

// Mock database - In production, use a real database
const reservations = [
  {
    id: '1',
    userId: 'user-1',
    equipmentId: '1',
    startDate: '2025-02-10T09:00:00',
    endDate: '2025-02-12T17:00:00',
    status: 'approved',
    notes: 'Regular maintenance',
  },
  {
    id: '2',
    userId: 'user-1',
    equipmentId: '2',
    startDate: '2025-02-15T10:00:00',
    endDate: '2025-02-17T16:00:00',
    status: 'pending',
    notes: 'Special project',
  },
  {
    id: '3',
    userId: 'team-1',
    equipmentId: '3',
    startDate: '2025-02-20T08:00:00',
    endDate: '2025-02-22T18:00:00',
    status: 'approved',
    notes: 'Team research',
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    if (req.method === 'GET') {
      let userReservations;
      
      // If admin, return all reservations with user and equipment details
      if (decoded.role === 'admin') {
        userReservations = reservations.map(reservation => {
          const user = users.find(u => u.id === reservation.userId);
          const equipmentItem = equipment.find(e => e.id === reservation.equipmentId);
          
          return {
            ...reservation,
            userName: user?.name || 'Unknown User',
            equipmentName: equipmentItem?.name || 'Unknown Equipment'
          };
        });
      } else {
        // For regular users, only return their reservations
        userReservations = reservations
          .filter(r => r.userId === decoded.id)
          .map(reservation => {
            const equipmentItem = equipment.find(e => e.id === reservation.equipmentId);
            return {
              ...reservation,
              equipmentName: equipmentItem?.name || 'Unknown Equipment'
            };
          });
      }
      
      res.status(200).json(userReservations);
    } else if (req.method === 'POST') {
      // Create new reservation
      const { equipmentId, startDate, endDate, notes } = req.body;
      
      if (!equipmentId || !startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Equipment ID, start date, and end date are required' 
        });
      }

      // Check if equipment is already reserved for these dates
      const conflictingReservation = reservations.find(r => 
        r.equipmentId === equipmentId &&
        ((new Date(startDate) >= new Date(r.startDate) && new Date(startDate) <= new Date(r.endDate)) ||
         (new Date(endDate) >= new Date(r.startDate) && new Date(endDate) <= new Date(r.endDate)))
      );

      if (conflictingReservation) {
        return res.status(400).json({ 
          message: 'Equipment is already reserved for these dates' 
        });
      }

      const newReservation = {
        id: String(reservations.length + 1),
        userId: decoded.id,
        equipmentId,
        startDate,
        endDate,
        status: 'pending',
        notes: notes || '',
      };

      reservations.push(newReservation);
      
      const equipmentItem = equipment.find(e => e.id === equipmentId);
      res.status(201).json({
        ...newReservation,
        equipmentName: equipmentItem?.name || 'Unknown Equipment'
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Reservations API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
