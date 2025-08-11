const express = require('express');
const { createCourse, getAllCourses, getCourse } = require('../controllers/coursesController');
const { isAdmin } = require('../middlewares/auth');

const router = express.Router();

router.post('/create-course', createCourse);
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourse);

module.exports = router;