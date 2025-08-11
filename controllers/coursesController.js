const dotenv = require("dotenv");
const axios = require("axios");
const News = require("../models/news.js");

dotenv.config();

// All courses
async function getAllCourses(req, res) {
    res.json({ message: "Get all courses" });
}

// For single course with id
async function getCourse(req, res) {
    const { id } = req.params;
    res.json({ message: `Get course with ID: ${id}` });
}

// ADMIN - Creating course
async function createCourse(req, res) {
    res.json({ message: "Course created" });
}

// ADMIN - Deleting course with id
async function deleteCourse(req, res) {
    const { id } = req.params;
    res.json({ message: `Course with ID: ${id} deleted` });
}

module.exports = {
    getAllCourses,
    getCourse,
    createCourse,
    deleteCourse
};