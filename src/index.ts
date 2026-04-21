import express from 'express';
import cors from 'cors';
import tenderRoutes from './routes/tender.routes';
import deliverableRoutes from './routes/deliverable.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no está definido en las variables de entorno');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

// Routes Director
app.use('/api/tender-processes', tenderRoutes);
app.use('/api/deliverables', deliverableRoutes);

// Auth & Users
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor Valdivia Backend - Director Module' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
