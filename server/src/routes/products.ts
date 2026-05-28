import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, minPrice, maxPrice, search, sort, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (search) where.name = { contains: String(search), mode: 'insensitive' };

    const orderBy: any = {};
    if (sort === 'price_asc') orderBy.price = 'asc';
    else if (sort === 'price_desc') orderBy.price = 'desc';
    else if (sort === 'name') orderBy.name = 'asc';
    else orderBy.createdAt = 'desc';

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    res.json({ products, total, page: pageNum, limit: limitNum });
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/categories', async (_req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.product.findMany({ select: { category: true }, distinct: ['category'] });
    res.json(categories.map(c => c.category));
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;