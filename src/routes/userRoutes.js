import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/', userController.registarUser);
router.get('/', userController.getUsers);
router.put('/:email/desativar', userController.desativarUser);

export default router;