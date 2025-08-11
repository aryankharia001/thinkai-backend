import express from 'express';

const router = express.Router();

router.get('/courses', coursesController);

export default router;