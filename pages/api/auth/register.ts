import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

// Mock user store - In production, use a real database
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  type: 'individual' | 'team';
  teamMembers?: string[];
}

let users: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$GQH.dAoVYqVPGYXJjzNBY.qL.FuJ7qw0c5oZBd8KGWLiTkQ9o7VYi', // admin123
    role: 'admin',
    type: 'individual'
  },
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$8DxhFXxX9jG4Zy9x.9zX7O5vJ5J5X5J5X5J5X5J5X5J5X5J5X5', // user123
    role: 'user',
    type: 'individual'
  },
  {
    id: 'team-1',
    name: 'Research Team Alpha',
    email: 'team.alpha@example.com',
    password: '$2a$10$8DxhFXxX9jG4Zy9x.9zX7O5vJ5J5X5J5X5J5X5J5X5J5X5J5X5', // team123
    role: 'user',
    type: 'team',
    teamMembers: ['researcher1@example.com', 'researcher2@example.com']
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name, type, members } = req.body;

    if (!email || !password || !name || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // For team registration, validate team members
    if (type === 'team') {
      if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'Team members are required for team registration' });
      }

      // Validate team member emails
      const invalidEmails = members.filter(email => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
      if (invalidEmails.length > 0) {
        return res.status(400).json({ 
          message: 'Invalid team member email(s): ' + invalidEmails.join(', ')
        });
      }

      // Check if any team member email is already registered
      const existingMembers = members.filter(memberEmail => 
        users.some(user => user.email === memberEmail)
      );
      if (existingMembers.length > 0) {
        return res.status(400).json({ 
          message: 'Some team members are already registered: ' + existingMembers.join(', ')
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser: User = {
      id: `${type}-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      type,
      ...(type === 'team' && { teamMembers: members })
    };

    // In a real app, save to database
    users.push(newUser);

    // Return success without sensitive data
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
