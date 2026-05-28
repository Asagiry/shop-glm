import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logEvent } from './utils/logger';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 80;

app.use(cors({
  origin: ['http://glm-shop.voimaxgm.online', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, '../../../assets')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

const clientDist = path.join(__dirname, '../../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

async function main() {
  await prisma.$connect();
  logEvent('Server starting up');
  app.listen(PORT, () => {
    logEvent(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch((e) => {
  logEvent(`Server startup error: ${e.message}`);
  console.error(e);
  process.exit(1);
});

export { prisma };