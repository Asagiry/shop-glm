import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, AuthRequest, authMiddleware } from '../middleware/auth';
import { logEvent } from '../utils/logger';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      logEvent(`Failed registration: email already exists - ${email}`);
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = generateToken(user.id, user.role);
    logEvent(`Successful registration: ${email}`);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e: any) {
    logEvent(`Registration error: ${e.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logEvent(`Failed login: user not found - ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logEvent(`Failed login: wrong password - ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);
    logEvent(`Successful login: ${email}`);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e: any) {
    logEvent(`Login error: ${e.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { orders: { include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, orders: user.orders });
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    logEvent(`Password reset requested for: ${email}`);
    res.json({ token, message: 'Reset token generated' });
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Missing fields' });

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: reset.userId }, data: { password: hashedPassword } });
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });

    logEvent(`Password reset successful for user ID: ${reset.userId}`);
    res.json({ message: 'Password updated successfully' });
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;