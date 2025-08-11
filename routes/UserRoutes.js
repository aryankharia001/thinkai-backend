const express = require('express');
const { createCourse } = require('../controllers/coursesController');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const { getAllUsers, deleteUser, updateUserRole } = require('../controllers/userController');

const router = express.Router();

// ADMIN - get all users
router.get('/admin/users', verifyToken, isAdmin, getAllUsers);

// UPDATE user role
router.put("/admin/users/:id", verifyToken, isAdmin, updateUserRole);

// DELETE user
router.delete("/admin/users/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;