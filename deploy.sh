#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Build frontend first
echo "Building frontend..."
cd frontend
npm install
npm run build

# Create production build directory in backend
echo "Setting up static files..."
mkdir -p ../backend/public
cp -r build/* ../backend/public/

# Deploy backend
echo "Building and deploying backend..."
cd ../backend
npm install
npm run build

# Copy production environment file
if [ -f .env.production ]; then
  cp .env.production .env
else
  echo "Warning: .env.production not found. Make sure to set up environment variables."
fi

# Stop existing PM2 process if it exists
pm2 stop mobile-lending-backend || true
pm2 delete mobile-lending-backend || true

# Start new PM2 process
echo "Starting backend server..."
pm2 start npm --name "mobile-lending-backend" -- start

# Save PM2 process list
pm2 save

echo "Deployment completed successfully!"
echo "Application should now be accessible at http://localhost:5000" 