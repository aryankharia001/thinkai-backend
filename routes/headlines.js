const express = require('express');
const { getHeadlines } = require('../controllers/headlinesController');

const router = express.Router();

router.get('/headlines', getHeadlines);

module.exports = router;