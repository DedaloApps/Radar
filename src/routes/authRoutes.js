import express from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/register', authController.registar);
router.post('/login', authController.login);
router.get('/invite/validate/:code', authController.validarConvite);

// Rotas protegidas (admin)
router.post('/invite/create', requireAuth, requireAdmin, authController.criarConvite);
router.get('/invites', requireAuth, requireAdmin, authController.listarConvites);

export default router;