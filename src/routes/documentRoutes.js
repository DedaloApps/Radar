import express from 'express';
import * as documentController from '../controllers/documentController.js';

const router = express.Router();

router.get('/', documentController.getRecentDocuments);
router.get('/stats', documentController.getStats);
router.get('/search', documentController.searchDocuments);

export default router;