const Library = require('../models/Library');
const Content = require('../models/Content');

// Add new library
const addLibrary = async (req, res) => {
    try {
        const { title, description, level, content, icon } = req.body;
        
        if (!title || !description || !level || !icon) {
            return res.status(400).json({
                status: 400, 
                message: "All data is required (title, description, level, icon)"
            });
        }

        // Check if library with same title exists
        const existingLibrary = await Library.findOne({ 
            title: { $regex: new RegExp(`^${title}$`, 'i') } 
        });
        
        if (existingLibrary) {
            return res.status(409).json({
                status: 409,
                message: "Library with this title already exists"
            });
        }

        const newLibrary = new Library({
            title,
            description,
            level,
            content: content || [],
            icon
        });

        const savedLibrary = await newLibrary.save();

        res.status(201).json({
            status: 201,
            message: "Library created successfully",
            data: savedLibrary
        });

    } catch (error) {
        console.error('Error creating library:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all libraries
const getAllLibraries = async (req, res) => {
    try {
        const libraries = await Library.find()
            .populate('content', 'title description contentType')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 200,
            message: "Libraries fetched successfully",
            count: libraries.length,
            data: libraries
        });

    } catch (error) {
        console.error('Error fetching libraries:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get single library by ID
const getLibraryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid library ID format"
            });
        }

        const library = await Library.findById(id)
            .populate('content', 'icon title description contentType views likes ');

        if (!library) {
            return res.status(404).json({
                status: 404,
                message: "Library not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Library fetched successfully",
            data: library
        });

    } catch (error) {
        console.error('Error fetching library:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update library
const updateLibrary = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, level, content, icon } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid library ID format"
            });
        }

        if (!title || !description || !level || !icon) {
            return res.status(400).json({
                status: 400,
                message: "All data is required (title, description, level, icon)"
            });
        }

        // Check if another library with same title exists (excluding current one)
        const existingLibrary = await Library.findOne({ 
            title: { $regex: new RegExp(`^${title}$`, 'i') },
            _id: { $ne: id }
        });
        
        if (existingLibrary) {
            return res.status(409).json({
                status: 409,
                message: "Library with this title already exists"
            });
        }

        const updatedLibrary = await Library.findByIdAndUpdate(
            id,
            {
                title,
                description,
                level,
                content: content || [],
                icon
            },
            { 
                new: true,
                runValidators: true
            }
        ).populate('content', 'title description contentType');

        if (!updatedLibrary) {
            return res.status(404).json({
                status: 404,
                message: "Library not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Library updated successfully",
            data: updatedLibrary
        });

    } catch (error) {
        console.error('Error updating library:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete library
const deleteLibrary = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid library ID format"
            });
        }

        const deletedLibrary = await Library.findByIdAndDelete(id);

        if (!deletedLibrary) {
            return res.status(404).json({
                status: 404,
                message: "Library not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Library deleted successfully",
            data: deletedLibrary
        });

    } catch (error) {
        console.error('Error deleting library:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get libraries with pagination
const getLibrariesWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const libraries = await Library.find()
            .populate('content', 'title description contentType')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalLibraries = await Library.countDocuments();
        const totalPages = Math.ceil(totalLibraries / limit);

        res.status(200).json({
            status: 200,
            message: "Libraries fetched successfully",
            data: libraries,
            pagination: {
                currentPage: page,
                totalPages,
                totalLibraries,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching libraries:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Search libraries
const searchLibraries = async (req, res) => {
    try {
        const { query, level } = req.query;

        if (!query) {
            return res.status(400).json({
                status: 400,
                message: "Search query is required"
            });
        }

        let searchFilter = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };

        if (level) {
            searchFilter.level = level;
        }

        const libraries = await Library.find(searchFilter)
            .populate('content', 'title description contentType')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 200,
            message: "Search completed successfully",
            count: libraries.length,
            data: libraries
        });

    } catch (error) {
        console.error('Error searching libraries:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update library icon only
const updateLibraryIcon = async (req, res) => {
    try {
        const { id } = req.params;
        const { icon } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid library ID format"
            });
        }

        if (!icon) {
            return res.status(400).json({
                status: 400,
                message: "Icon is required"
            });
        }

        const updatedLibrary = await Library.findByIdAndUpdate(
            id,
            { icon },
            { 
                new: true,
                runValidators: true
            }
        ).populate('content', 'title description contentType');

        if (!updatedLibrary) {
            return res.status(404).json({
                status: 404,
                message: "Library not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Library icon updated successfully",
            data: updatedLibrary
        });

    } catch (error) {
        console.error('Error updating library icon:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    addLibrary,
    getAllLibraries,
    getLibraryById,
    updateLibrary,
    deleteLibrary,
    getLibrariesWithPagination,
    searchLibraries,
    updateLibraryIcon
};