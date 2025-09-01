const Content = require('../models/Content');
const Library = require('../models/Library')
const cloudinary = require("../Utils/cloudinary"); // adjust path

// const addContent = async (req, res) => {
//   try {
//     const { title, description, method, prompt, library } = req.body;

//     if (!title || !description || !method || !prompt || !library) {
//       return res.status(400).json({
//         status: 400,
//         message: "All required fields must be provided",
//       });
//     }

//     // ✅ Check if content with same title exists
//     const existingContent = await Content.findOne({
//       title: { $regex: new RegExp(`^${title}$`, "i") },
//     });

//     if (existingContent) {
//       return res.status(409).json({
//         status: 409,
//         message: "Content with this title already exists",
//       });
//     }

//     // ✅ Check if library exists
//     const existingLibrary = await Library.findById(library);
//     if (!existingLibrary) {
//       return res.status(404).json({
//         status: 404,
//         message: "Library not found",
//       });
//     }

//     let videoUrl = null;

//     // ✅ Upload video if provided
//     if (req.file) {
//       const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
//         resource_type: "video", // 👈 IMPORTANT for video
//         folder: "library_videos",
//       });

//       videoUrl = uploadResponse.secure_url;
//     }

//     // ✅ Create new content
//     const newContent = new Content({
//       title,
//       description,
//       videoUrl,
//       method,
//       prompt,
//       library,
//     });

//     const savedContent = await newContent.save();

//     // ✅ Push into Library
//     existingLibrary.content.push(savedContent._id);
//     await existingLibrary.save();

//     res.status(201).json({
//       status: 201,
//       message: "Content created successfully",
//       data: savedContent,
//     });
//   } catch (error) {
//     console.error("Error creating content:", error);
//     res.status(500).json({
//       status: 500,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// Get all content


const addContent = async (req, res) => {
  try {
    const { title, description, method, prompt, library, videoUrl } = req.body;
     console.log("user : ", req.body);
    // Only check required fields (videoUrl is optional)
    if (!title || !description || !method || !prompt || !library) {
      return res.status(400).json({
        status: 400,
        message: "All required fields must be provided (title, description, method, prompt, library)",
      });
    }

    // Check if content with same title exists
    const existingContent = await Content.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (existingContent) {
      return res.status(409).json({
        status: 409,
        message: "Content with this title already exists",
      });
    }

    // Check if library exists
    const existingLibrary = await Library.findById(library);
    if (!existingLibrary) {
      return res.status(404).json({
        status: 404,
        message: "Library not found",
      });
    }

    let finalVideoUrl = null;

    // Handle video upload (file) - priority over URL
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "library_videos",
      });
      finalVideoUrl = uploadResponse.secure_url;
    } 
    // If no file uploaded, use videoUrl from body (if provided)
    else if (videoUrl) {
      finalVideoUrl = videoUrl;
    }

    // Create new content
    const newContent = new Content({
      title,
      description,
      videoUrl: finalVideoUrl, // This can be null, which is fine
      method,
      prompt,
      library,
    });

    const savedContent = await newContent.save();

    // Push content ID into Library
    existingLibrary.content.push(savedContent._id);
    await existingLibrary.save();

    res.status(201).json({
      status: 201,
      message: "Content created successfully",
      data: savedContent,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const getAllContent = async (req, res) => {
    try {
        const content = await Content.find()
            .populate("library") // populate library references
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 200,
            message: "Content fetched successfully",
            count: content.length,
            data: content
        });

    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getContentByLibraryId = async (req, res) => {
    try {
        const { libraryId } = req.params;

        const content = await Content.find({ library: libraryId })
            .populate("library")
            .sort({ createdAt: -1 });

        if (!content || content.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No content found for this library"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Content fetched successfully",
            count: content.length,
            data: content
        });

    } catch (error) {
        console.error("Error fetching content by libraryId:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get single content by ID
const getContentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid content ID format"
            });
        }

        const content = await Content.findById(id).populate("library");

        if (!content) {
            return res.status(404).json({
                status: 404,
                message: "Content not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Content fetched successfully",
            data: content
        });

    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update content
const updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, videoUrl, method, prompt, library } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid content ID format"
            });
        }

        if (!title || !description || !method || !prompt) {
            return res.status(400).json({
                status: 400,
                message: "All required fields must be provided"
            });
        }

        // Check if another content with same title exists (excluding current one)
        const existingContent = await Content.findOne({
            title: { $regex: new RegExp(`^${title}$`, 'i') },
            _id: { $ne: id }
        });

        if (existingContent) {
            return res.status(409).json({
                status: 409,
                message: "Content with this title already exists"
            });
        }

        const updatedContent = await Content.findByIdAndUpdate(
            id,
            {
                title,
                description,
                videoUrl: videoUrl || null,
                method,
                prompt,
                library: library || []
            },
            {
                new: true,
                runValidators: true
            }
        ).populate("library");

        if (!updatedContent) {
            return res.status(404).json({
                status: 404,
                message: "Content not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Content updated successfully",
            data: updatedContent
        });

    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete content
const deleteContent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid content ID format"
            });
        }

        const deletedContent = await Content.findByIdAndDelete(id).populate("library");

        if (!deletedContent) {
            return res.status(404).json({
                status: 404,
                message: "Content not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Content deleted successfully",
            data: deletedContent
        });

    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get content with pagination
const getContentWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const content = await Content.find()
            .populate("library")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalContent = await Content.countDocuments();
        const totalPages = Math.ceil(totalContent / limit);

        res.status(200).json({
            status: 200,
            message: "Content fetched successfully",
            data: content,
            pagination: {
                currentPage: page,
                totalPages,
                totalContent,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Search content
const searchContent = async (req, res) => {
    try {
        const { query, method } = req.query;

        if (!query) {
            return res.status(400).json({
                status: 400,
                message: "Search query is required"
            });
        }

        let searchFilter = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { prompt: { $regex: query, $options: 'i' } }
            ]
        };

        if (method) {
            searchFilter.method = { $regex: method, $options: 'i' };
        }

        const content = await Content.find(searchFilter)
            .populate("library")
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 200,
            message: "Search completed successfully",
            count: content.length,
            data: content
        });

    } catch (error) {
        console.error('Error searching content:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get content by method
const getContentByMethod = async (req, res) => {
    try {
        const { method } = req.params;

        const content = await Content.find({
            method: { $regex: new RegExp(`^${method}$`, 'i') }
        }).populate("library").sort({ createdAt: -1 });

        res.status(200).json({
            status: 200,
            message: "Content fetched successfully",
            count: content.length,
            data: content
        });

    } catch (error) {
        console.error('Error fetching content by method:', error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    addContent,
    getAllContent,
    getContentById,
    updateContent,
    deleteContent,
    getContentWithPagination,
    searchContent,
    getContentByMethod,
    getContentByLibraryId
};
