import express from 'express';
import cors from 'cors';
import tenderRoutes from './routes/tender.routes';
import deliverableRoutes from './routes/deliverable.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
