import express from 'express';
import { getHeadlines } from '../controllers/headlinesController.js';

const router = express.Router();

router.get('/headlines', getHeadlines);

export default router;