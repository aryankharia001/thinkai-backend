const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/auth');

// ✅ Create order - no auth required for now
router.post('/create-order', createOrder);

// ✅ Verify payment and update user
router.post('/verify-payment', verifyPayment);


module.exports = router;