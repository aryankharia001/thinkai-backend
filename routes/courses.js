const express = require('express');
const { createCourse, getAllCourses, getCourse, deleteCourse, updateCourse } = require('../controllers/coursesController');
const { isAdmin, verifyToken } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourse);

// ADMIN routes
router.post('/admin/courses/create', verifyToken, isAdmin, createCourse);
router.delete('/admin/courses/delete/:id', verifyToken, isAdmin, deleteCourse);
router.put('/admin/courses/update/:id', verifyToken, isAdmin, updateCourse); // ✅ Changed from DELETE to PUT

module.exports = router;