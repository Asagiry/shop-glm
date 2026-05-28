#!/bin/bash
set -e

APP_DIR="/home/base-ubuntu/shop"
DB_URL="postgresql://postgres:postgres@localhost:5432/app"

echo "=== Deploying E-Commerce Shop ==="

cd "$APP_DIR"

echo ">>> Pulling latest code..."
git pull origin main || true

echo ">>> Installing server dependencies..."
cd server
npm install --legacy-peer-deps
cd ..

echo ">>> Installing client dependencies..."
cd client
npm install --legacy-peer-deps
cd ..

echo ">>> Copying product assets..."
cp -r assets/ client/public/assets/

echo ">>> Building client..."
cd client
npm run build
cd ..

echo ">>> Building server..."
cd server
DATABASE_URL="$DB_URL" npx tsc
cd ..

echo ">>> Running Prisma migrations..."
cd server
DATABASE_URL="$DB_URL" npx prisma migrate deploy
cd ..

echo ">>> Seeding database..."
cd server
DATABASE_URL="$DB_URL" node dist/prisma/seed.js
cd ..

echo ">>> Stopping any existing PM2 process..."
sudo pm2 delete shop || true

echo ">>> Starting application under PM2 on port 80..."
cd server
sudo DATABASE_URL="$DB_URL" PORT=80 pm2 start dist/src/index.js --name shop
sudo pm2 save

echo "=== Deployment Complete ==="