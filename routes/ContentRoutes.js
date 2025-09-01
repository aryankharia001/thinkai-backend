const express = require('express');
const router = express.Router();
const {deleteContent,updateContent,getContentById,getAllContent,addContent,searchContent,getContentByLibraryId} = require('../controllers/ContentController');

//add content
router.post('/content', addContent);

// Get all libraries
router.get('/allcontents', getAllContent);
router.get('/library/:libraryId', getContentByLibraryId);

// Search libraries
router.get('/libra/search', searchContent);

// Get single library by ID
router.get('/content/:id', getContentById);

// Update library
router.put('/content/:id', updateContent);

// Delete library
router.delete('/content/:id', deleteContent);


module.exports = router;