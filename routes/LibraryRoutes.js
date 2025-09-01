// routes/LibraryRoutes.js
const express = require('express');
const router = express.Router();
const {
    addLibrary,
    getAllLibraries,
    getLibraryById,
    updateLibrary,
    deleteLibrary,
    getLibrariesWithPagination,
    searchLibraries
} = require('../controllers/LibraryController');

// Create new library
router.post('/library', addLibrary);

// Get all libraries
router.get('/libraries', getAllLibraries);

// Get libraries with pagination
router.get('/libraries/paginated', getLibrariesWithPagination);

// Search libraries
router.get('/libraries/search', searchLibraries);

// Get single library by ID
router.get('/library/:id', getLibraryById);

// Update library
router.put('/library/:id', updateLibrary);

// Delete library
router.delete('/library/:id', deleteLibrary);

module.exports = router;