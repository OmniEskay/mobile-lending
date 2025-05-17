import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config';

// Import routes
import authRoutes from './routes/auth';
import loanRoutes from './routes/loans';
import userRoutes from './routes/users';
import paymentRoutes from './routes/payments';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// General middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Serve static files in production
if (config.env === 'production') {
  // Serve static files from the React app
  const staticPath = path.resolve(__dirname, '../../frontend/build');
  app.use(express.static(staticPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(staticPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: config.env === 'development' ? err.message : 'Something went wrong!',
    error: config.env === 'development' ? err : undefined,
  });
});

// Database connection with retry logic
const connectWithRetry = () => {
  mongoose
    .connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Successfully connected to MongoDB.');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Start server
const server = app.listen(config.port, () => {
  console.log(`Server running in ${config.env} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 