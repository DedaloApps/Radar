import express from 'express';
import * as stakeholderController from '../controllers/stakeholderController.js';

const router = express.Router();

router.get('/documents', stakeholderController.getStakeholderDocuments);
router.get('/stats', stakeholderController.getStakeholderStats);
router.get('/search', stakeholderController.searchStakeholderDocuments);

export default router;