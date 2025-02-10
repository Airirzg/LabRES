import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, always use environment variable

// Mock user store - In production, use a real database
const users: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$YPtPmYfzXByqXLwtWFkdNevzFEPN8ZlM3tsl9iWg6QV79K65d7dwy', // user123
    role: 'admin',
    type: 'individual'
  },
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$YPtPmYfzXByqXLwtWFkdNevzFEPN8ZlM3tsl9iWg6QV79K65d7dwy', // user123
    role: 'user',
    type: 'individual'
  },
  {
    id: 'team-1',
    name: 'Research Team Alpha',
    email: 'team.alpha@example.com',
    password: '$2a$10$YPtPmYfzXByqXLwtWFkdNevzFEPN8ZlM3tsl9iWg6QV79K65d7dwy', // user123
    role: 'user',
    type: 'team',
    teamMembers: ['researcher1@example.com', 'researcher2@example.com']
  }
];

interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse | { message: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Don't log passwords

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user || !user.password) {
      console.log('User not found:', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    console.log('Comparing passwords for:', { email });
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', { isValidPassword });

    if (!isValidPassword) {
      console.log('Invalid password for:', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token
    console.log('Creating token for:', { email });
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        type: user.type,
        ...(user.type === 'team' && { teamMembers: user.teamMembers })
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user info and token (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    console.log('Login successful:', { email });
    res.status(200).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
