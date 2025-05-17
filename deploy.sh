#!/bin/bash

# Build and deploy backend
echo "Building backend..."
cd backend
npm install
npm run build

# Copy production environment file
cp .env.production .env

echo "Starting backend server..."
pm2 start npm --name "mobile-lending-backend" -- start

# Build and deploy frontend
echo "Building frontend..."
cd ../frontend
npm install
npm run build

# Copy production environment file
cp .env.production .env

# Deploy frontend build to web server
echo "Deploying frontend..."
# Add your deployment commands here, e.g.:
# rsync -avz build/ user@your-server:/var/www/html/

echo "Deployment completed!" 