const Course = require('../models/courses');
const User = require('../models/UserModel');

// ✅ Get all courses with access information
async function getAllCourses(req, res) {
    try {
      const courses = await Course.find({ isActive: true }).sort({ createdAt: 1 });
      
      // If user is authenticated, add access information
      if (req.user) {
        const user = await User.findById(req.user.id);
        const coursesWithAccess = courses.map(course => ({
          ...course.toObject(),
          canAccess: user ? user.canAccessCourse(course.price) : false,
          requiredPayment: user ? user.getRequiredPayment(course.price) : (course.price > 0 ? (course.price <= 200 ? 200 : 1000) : 0)
        }));
        
        return res.status(200).json({
          success: true,
          count: coursesWithAccess.length,
          data: coursesWithAccess,
          userTier: user.subscriptionTier
        });
      }
      
      // For non-authenticated users, all paid courses are locked
      const coursesForGuest = courses.map(course => ({
        ...course.toObject(),
        canAccess: course.price === 0 ? false : false, // All courses locked for non-auth users
        requiredPayment: course.price > 0 ? (course.price <= 200 ? 200 : 1000) : 0,
        requiresLogin: true
      }));
  
      res.status(200).json({
        success: true,
        count: coursesForGuest.length,
        data: coursesForGuest,
        userTier: "guest"
      });
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching courses"
      });
    }
}

// ✅ Get single course with access check
async function getCourse(req, res) {
    try {
      const { id } = req.params;
      const course = await Course.findById(id);
  
      if (!course) {
        return res.status(404).json({ success: false, message: "No such course found" });
      }

      // Check if user is authenticated and has access
      if (req.user) {
        const user = await User.findById(req.user.id);
        const canAccess = user.canAccessCourse(course.price);
        
        res.status(200).json({ 
          success: true, 
          data: {
            ...course.toObject(),
            canAccess,
            requiredPayment: user.getRequiredPayment(course.price),
            userTier: user.subscriptionTier
          }
        });
      } else {
        // Non-authenticated user
        res.status(200).json({ 
          success: true, 
          data: {
            ...course.toObject(),
            canAccess: false,
            requiredPayment: course.price > 0 ? (course.price <= 200 ? 200 : 1000) : 0,
            requiresLogin: true,
            userTier: "guest"
          }
        });
      }
    } catch (err) {
      console.error("Error fetching course:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching course"
      });
    }
}

// ✅ ADMIN - Creating course with tier assignment
async function createCourse(req, res) {
    try {
      const { title, description, image, price, duration, level } = req.body;
  
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      const courseData = {
        title,
        description,
        image: image || "",
        price: Number(price) || 0,
        duration: duration || "",
        level: level || "Beginner"
      };

      const course = await Course.create(courseData);
  
      res.status(201).json({
        message: "✅ Course created successfully",
        course
      });
    } catch (err) {
      console.error("Error creating course:", err);
      res.status(500).json({ error: "Server error" });
    }
}

// ✅ ADMIN - Deleting course
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

// ✅ ADMIN - Update course
async function updateCourse(req, res) {
    try {
        const { id } = req.params;
        const { title, description, image, price, duration, level } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (image !== undefined) updateData.image = image;
        if (price !== undefined) updateData.price = Number(price);
        if (duration !== undefined) updateData.duration = duration;
        if (level) updateData.level = level;

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true,
                runValidators: true
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

// ✅ Get user's accessible courses
async function getUserCourses(req, res) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const accessibleCourses = await Course.getCoursesByAccessLevel(user.totalPaid);
        
        res.status(200).json({
            success: true,
            count: accessibleCourses.length,
            data: accessibleCourses,
            userTier: user.subscriptionTier,
            totalPaid: user.totalPaid
        });
    } catch (err) {
        console.error("Error fetching user courses:", err);
        res.status(500).json({
            success: false,
            message: "Server error while fetching accessible courses"
        });
    }
}

module.exports = {
    getAllCourses,
    getCourse,
    createCourse,
    deleteCourse,
    updateCourse,
    getUserCourses
};