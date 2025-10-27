import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { testConnection } from './config/supabase.js';
import { iniciarAgendamento } from './services/scheduler.js';
import documentRoutes from './routes/documentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import stakeholderRoutes from './routes/stakeholderRoutes.js'; // ← NOVO

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://radar-vul1.onrender.com',
    'https://radar-frontend-sable.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true
}));
app.use(express.json());

// Rotas
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stakeholders', stakeholderRoutes); // ← NOVO

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Radar Legislativo API',
    timestamp: new Date()
  });
});

// Iniciar servidor
async function iniciarServidor() {
  try {
    await testConnection();
    // iniciarAgendamento();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📡 API disponível em http://localhost:${PORT}/api`);
      console.log(`🔐 Auth disponível em http://localhost:${PORT}/api/auth`);
      console.log(`✅ Supabase conectado\n`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

iniciarServidor();