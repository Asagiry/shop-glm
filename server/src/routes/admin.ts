import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { logEvent } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.use(authMiddleware, adminMiddleware);

router.get('/products', async (_req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/products', upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, sizes, stock, imageUrl } = req.body;
    let finalImageUrl = '';

    if (imageUrl && imageUrl.startsWith('http')) {
      try {
        const fileName = Date.now() + '-' + path.basename(imageUrl).split('?')[0];
        const filePath = path.join(uploadDir, fileName);
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
        fs.writeFileSync(filePath, response.data);
        finalImageUrl = `/uploads/${fileName}`;
        logEvent(`Admin downloaded image from URL: ${imageUrl}`);
      } catch (downloadErr: any) {
        logEvent(`Admin image download failed: ${downloadErr.message}`);
        finalImageUrl = imageUrl;
      }
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    } else if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const product = await prisma.product.create({
      data: {
        name, description: description || '', price: Number(price),
        category: category || 'T-Shirts', sizes: sizes || 'S,M,L,XL',
        stock: Number(stock) || 0, imageUrl: finalImageUrl,
      },
    });
    logEvent(`Admin created product: ${name}, price ${price}`);
    res.json(product);
  } catch (e: any) {
    logEvent(`Admin product creation error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

router.put('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, description, price, category, sizes, stock, imageUrl } = req.body;
    let finalImageUrl = existing.imageUrl;

    if (imageUrl && imageUrl.startsWith('http') && imageUrl !== existing.imageUrl) {
      try {
        const fileName = Date.now() + '-' + path.basename(imageUrl).split('?')[0];
        const filePath = path.join(uploadDir, fileName);
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
        fs.writeFileSync(filePath, response.data);
        finalImageUrl = `/uploads/${fileName}`;
        logEvent(`Admin downloaded new image from URL: ${imageUrl}`);
      } catch (downloadErr: any) {
        logEvent(`Admin image download failed: ${downloadErr.message}`);
      }
    } else if (imageUrl && !imageUrl.startsWith('http')) {
      finalImageUrl = imageUrl;
    }

    if (price && Number(price) !== existing.price) {
      logEvent(`Admin changed product price: ${existing.name} from ${existing.price} to ${price}`);
    }

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name: name || existing.name,
        description: description || existing.description,
        price: Number(price) || existing.price,
        category: category || existing.category,
        sizes: sizes || existing.sizes,
        stock: Number(stock) || existing.stock,
        imageUrl: finalImageUrl,
      },
    });
    res.json(product);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    logEvent(`Admin deleted product ID: ${req.params.id}`);
    res.json({ message: 'Product deleted' });
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/orders', async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/orders/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Confirmed', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { items: { include: { product: true } } },
    });
    logEvent(`Admin updated order ${req.params.id} status to ${status}`);
    res.json(order);
  } catch (e: any) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;