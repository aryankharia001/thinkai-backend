const express = require('express');
const { getHeadlines } = require('../controllers/headlinesController');
const { getAIHeadlines } = require('../controllers/AiNewsController');

const router = express.Router();

router.get('/headlines', getHeadlines);
router.get('/news', getAIHeadlines);

module.exports = router;