import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Product_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Order_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "OrderItem_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "PasswordReset_id_seq" RESTART WITH 1`;

  const adminPassword = await bcrypt.hash('admin', 10);
  const user1Password = await bcrypt.hash('user123', 10);
  const user2Password = await bcrypt.hash('test123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@shop.com', password: adminPassword, name: 'Admin User', role: 'admin' },
  });
  const user1 = await prisma.user.create({
    data: { email: 'john@example.com', password: user1Password, name: 'John Doe', role: 'user' },
  });
  const user2 = await prisma.user.create({
    data: { email: 'jane@example.com', password: user2Password, name: 'Jane Smith', role: 'user' },
  });

  const productDefs = [
    { name: 'Vibe Miner T-Shirt', description: 'Premium cotton tee featuring the iconic Vibe Miner logo. Perfect for your mining adventures.', price: 29.99, category: 'T-Shirts', sizes: 'S,M,L,XL', imageUrl: '/assets/tshirt_vibe_miner.png', stock: 50 },
    { name: 'Pixel Heart T-Shirt', description: 'Show your love for indie games with this pixel heart design. Soft and comfortable fabric.', price: 24.99, category: 'T-Shirts', sizes: 'S,M,L,XL', imageUrl: '/assets/tshirt_pixel_heart.png', stock: 40 },
    { name: 'Synthwave Runner Tee', description: 'Retro synthwave aesthetic meets modern comfort. Neon colors that pop in any lighting.', price: 27.99, category: 'T-Shirts', sizes: 'S,M,L,XL,XXL', imageUrl: '/assets/tshirt_synthwave.png', stock: 35 },
    { name: 'Game Over T-Shirt', description: 'Classic game over screen design. A nostalgic tribute to the arcade era. Heavyweight cotton.', price: 22.99, category: 'T-Shirts', sizes: 'S,M,L,XL', imageUrl: '/assets/tshirt_game_over.png', stock: 60 },
    { name: 'Cyber Cat Tee', description: 'Futuristic cyberpunk cat design. Meow in the digital age with this unique artwork.', price: 31.99, category: 'T-Shirts', sizes: 'S,M,L,XL', imageUrl: '/assets/tshirt_cyber_cat.png', stock: 25 },
    { name: 'Loading Bar T-Shirt', description: 'Patience is a virtue - show it with this loading progress bar design. Geek humor at its best.', price: 19.99, category: 'T-Shirts', sizes: 'S,M,L,XL', imageUrl: '/assets/tshirt_loading_bar.png', stock: 45 },
    { name: 'Retro Gamepad Tee', description: 'Old-school gamepad illustration that takes you back to the golden age of gaming.', price: 26.99, category: 'T-Shirts', sizes: 'S,M,L,XL,XXL', imageUrl: '/assets/tshirt_retro_gamepad.png', stock: 55 },
    { name: 'Glitch Skull T-Shirt', description: 'Digital glitch effect on a skull motif. Edgy design for the tech-savvy gamer.', price: 28.99, category: 'T-Shirts', sizes: 'S,M,L,XL', imageUrl: '/assets/tshirt_glitch_skull.png', stock: 30 },
    { name: 'Space Invader Tee', description: 'Classic space invader pixel art. The alien threat never looked so stylish.', price: 23.99, category: 'T-Shirts', sizes: 'S,M,L,XL', imageUrl: '/assets/tshirt_space_invader.png', stock: 50 },
    { name: 'D20 Dice T-Shirt', description: 'Roll for initiative! D20 dice design for tabletop RPG enthusiasts. Critical hit guaranteed.', price: 25.99, category: 'T-Shirts', sizes: 'S,M,L,XL,XXL', imageUrl: '/assets/tshirt_d20_dice.png', stock: 40 },
    { name: 'Vibe Miner Poster - Mining Depths', description: 'Large format poster depicting a deep mining scene from Vibe Miner. High-quality print on 200gsm paper.', price: 15.99, category: 'Posters', sizes: 'A3,A4', imageUrl: '/assets/tshirt_vibe_miner.png', stock: 100 },
    { name: 'Pixel Art Collection Poster', description: 'A curated collection of pixel art characters from popular indie games. Museum-quality print.', price: 12.99, category: 'Posters', sizes: 'A3,A4,A5', imageUrl: '/assets/tshirt_pixel_heart.png', stock: 80 },
    { name: 'Synthwave Landscape Poster', description: 'Stunning synthwave sunset landscape. Perfect for your gaming room wall decoration.', price: 18.99, category: 'Posters', sizes: 'A2,A3,A4', imageUrl: '/assets/tshirt_synthwave.png', stock: 60 },
    { name: 'Cyberpunk City Poster', description: 'Neon-lit cyberpunk cityscape inspired by indie game aesthetics. Glow-in-the-dark ink details.', price: 20.99, category: 'Posters', sizes: 'A2,A3', imageUrl: '/assets/tshirt_cyber_cat.png', stock: 50 },
    { name: 'Indie Game Heroes Poster Set', description: 'Set of character portraits from beloved indie games including Vibe Miner protagonists. Collector edition.', price: 24.99, category: 'Posters', sizes: 'A3,A4', imageUrl: '/assets/tshirt_game_over.png', stock: 70 },
  ];

  const createdProducts: { id: number }[] = [];
  for (const p of productDefs) {
    const product = await prisma.product.create({ data: p });
    createdProducts.push(product);
  }

  const orders = [
    { userId: user1.id, name: 'John Doe', address: '123 Gaming Lane, Portland, OR', phone: '+1-555-0101', paymentMethod: 'card', total: 54.98, status: 'Delivered', items: [{ productId: createdProducts[0].id, size: 'L', quantity: 1, price: 29.99 }, { productId: createdProducts[1].id, size: 'M', quantity: 1, price: 24.99 }] },
    { userId: user1.id, name: 'John Doe', address: '123 Gaming Lane, Portland, OR', phone: '+1-555-0101', paymentMethod: 'paypal', total: 27.99, status: 'Shipped', items: [{ productId: createdProducts[2].id, size: 'XL', quantity: 1, price: 27.99 }] },
    { userId: user2.id, name: 'Jane Smith', address: '456 Retro Ave, Seattle, WA', phone: '+1-555-0202', paymentMethod: 'card', total: 78.97, status: 'Confirmed', items: [{ productId: createdProducts[6].id, size: 'L', quantity: 1, price: 26.99 }, { productId: createdProducts[7].id, size: 'M', quantity: 1, price: 28.99 }, { productId: createdProducts[3].id, size: 'S', quantity: 1, price: 22.99 }] },
    { userId: user2.id, name: 'Jane Smith', address: '456 Retro Ave, Seattle, WA', phone: '+1-555-0202', paymentMethod: 'crypto', total: 15.99, status: 'Delivered', items: [{ productId: createdProducts[10].id, size: 'A3', quantity: 1, price: 15.99 }] },
    { userId: admin.id, name: 'Admin User', address: '789 Dev Street, San Francisco, CA', phone: '+1-555-0303', paymentMethod: 'card', total: 56.98, status: 'New', items: [{ productId: createdProducts[4].id, size: 'L', quantity: 1, price: 31.99 }, { productId: createdProducts[9].id, size: 'XL', quantity: 1, price: 25.99 }] },
  ];

  for (const o of orders) {
    await prisma.order.create({
      data: {
        userId: o.userId,
        name: o.name,
        address: o.address,
        phone: o.phone,
        paymentMethod: o.paymentMethod,
        total: o.total,
        status: o.status,
        items: { create: o.items },
      },
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());