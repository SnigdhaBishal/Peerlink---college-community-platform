import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CONFIG } from './config';
import { UserProfile } from '../src/types';
import { INITIAL_USER } from '../src/data/initialData';

export interface UserAccount extends UserProfile {
  passwordHash?: string;
}

// In-Memory User Database Store
const usersDb = new Map<string, UserAccount>();

// Seed default user
const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);
usersDb.set(INITIAL_USER.email.toLowerCase(), {
  ...INITIAL_USER,
  passwordHash: defaultPasswordHash
});

export function generateToken(user: UserProfile): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    CONFIG.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    // If optional auth or unauthenticated demo mode, fallback to default user for seamless experience
    req.user = {
      id: INITIAL_USER.id,
      email: INITIAL_USER.email,
      name: INITIAL_USER.name,
      role: INITIAL_USER.role
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired access token.'
    });
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired access token.'
    });
  }
}

export const UserService = {
  findUserByEmail(email: string): UserAccount | undefined {
    return usersDb.get(email.toLowerCase());
  },

  registerUser(name: string, email: string, major: string, passwordHash: string): UserAccount {
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      major,
      gradYear: 2027,
      role: 'Student',
      university: 'Stanford University',
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      uploadedFilesCount: 0,
      peersHelpedCount: 0,
      passwordHash
    };
    usersDb.set(email.toLowerCase(), newUser);
    return newUser;
  },

  updateUserProfile(email: string, updates: Partial<UserProfile>): UserAccount | null {
    const existing = usersDb.get(email.toLowerCase());
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    usersDb.set(email.toLowerCase(), updated);
    return updated;
  },

  toPublicProfile(user: UserAccount): UserProfile {
    const { passwordHash, ...publicProfile } = user;
    return publicProfile;
  }
};
