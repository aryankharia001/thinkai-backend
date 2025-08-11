const Course = require('../models/courses');

// All courses
async function getAllCourses(req, res) {
    try {
      const courses = await Course.find();
  
      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching courses"
      });
    }
}

// For single course with id
async function getCourse(req, res) {
    try {
      const { id } = req.params;
  
      const course = await Course.findById(id);
  
      if (!course) {
        return res.status(404).json({ success: false, message: "No such course found" });
      }
  
      res.status(200).json({ success: true, data: course });
    } catch (err) {
      console.error("Error fetching course:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching course"
      });
    }
}

// ADMIN - Creating course
async function createCourse(req, res) {
    try {
      const { title, description } = req.body;
  
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }
  
      const course = await Course.create({
        title,
        description
      });
  
      res.status(201).json({
        message: "✅ Course created successfully",
        course
      });
    } catch (err) {
      console.error("Error creating course:", err);
      res.status(500).json({ error: "Server error" });
    }
}

// ✅ ADMIN - Deleting course with id (FIXED)
async function deleteCourse(req, res) {
    try {
        const { id } = req.params;

        const deletedCourse = await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: `Course "${deletedCourse.title}" deleted successfully`,
            data: deletedCourse
        });
    } catch (err) {
        console.error("Error deleting course:", err);
        res.status(500).json({
            success: false,
            message: "Server error while deleting course"
        });
    }
}

// ✅ ADMIN - update course (IMPLEMENTED)
async function updateCourse(req, res) {
    try {
        const { id } = req.params;
        const { title, description, image } = req.body;

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { title, description, image },
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validations
            }
        );

        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse
        });
    } catch (err) {
        console.error("Error updating course:", err);
        res.status(500).json({
            success: false,
            message: "Server error while updating course"
        });
    }
}

module.exports = {
    getAllCourses,
    getCourse,
    createCourse,
    deleteCourse,
    updateCourse
};