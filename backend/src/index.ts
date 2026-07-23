import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import pondRoutes from './routes/pond.routes';
import aquadocRoutes from './routes/aquadoc.routes';
import aquavoiceRoutes from './routes/aquavoice.routes';
import aquaadvisorRoutes from './routes/aquaadvisor.routes';
import aquafeedRoutes from './routes/aquafeed.routes';
import aquaconnectRoutes from './routes/aquaconnect.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ponds', pondRoutes);
app.use('/api/aquadoc', aquadocRoutes);
app.use('/api/aquavoice', aquavoiceRoutes);
app.use('/api/aquaadvisor', aquaadvisorRoutes);
app.use('/api/aquafeed', aquafeedRoutes);
app.use('/api/aquaconnect', aquaconnectRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
