import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logEvent } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { items, name, address, phone, paymentMethod } = req.body;
    if (!items || !items.length || !name || !address || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      orderItemsData.push({
        productId: product.id,
        size: item.size || 'M',
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.userId!,
        name,
        address,
        phone,
        paymentMethod: paymentMethod || 'mock',
        total,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    logEvent(`Order created: ID ${order.id}, user ${req.userId}, total ${total}`);
    res.json(order);
  } catch (e: any) {
    logEvent(`Order creation error: ${e.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(order);
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;