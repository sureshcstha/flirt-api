const Message = require("../models/message");
const mongoose = require("mongoose");

// Function to get a single random message
const getRandomMessage = async () => {
    return await Message.aggregate([{ $sample: { size: 1 } }]);
};

const getMessage = async(req, res) => {
    try {
        const validationErrors = [];
        const validQueryParams = ['random', 'category', 'featured', 'sort', 'select']; // Define supported query parameters

        // Check if there are any unsupported query parameters
        const queryKeys = Object.keys(req.query);
        queryKeys.forEach((key) => {
            if (!validQueryParams.includes(key)) {
                validationErrors.push(`Invalid query parameter: ${key}`);
            }
        });

        // Validate 'category' if it's present in the query
        if (req.query.category) {
            const validCategories = await Message.distinct('category');
            if (!validCategories.includes(req.query.category)) {
                validationErrors.push(`Invalid category: ${req.query.category}`);
            }
        }

        // Validate 'featured' if it's present in the query
        if (req.query.featured && !['true', 'false'].includes(req.query.featured)) {
            validationErrors.push(`'featured' must be either 'true' or 'false'`);
        }

        // If there are any validation errors, return them
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 400,
                statusText: 'Bad Request',
                message: 'Validation errors occurred',
                errors: validationErrors
            });
        }

        const {message, category, featured, sort, select} = req.query;
        const queryObject = {};
        
        if (category) {
            queryObject.category = category;
        }
        if (featured) {
            queryObject.featured = featured === 'true';
        }
        if (message) {
            queryObject.message = { $regex: message, $options: 'i' }; // Example: case-insensitive search for message
        }

        let query = Message.find(queryObject);

        // Handle sorting
        if (sort) {
            const sortBy = sort.split(',').join(' '); // Handle multiple sorting criteria
            query = query.sort(sortBy);
        }

        // Handle selecting specific fields
        if (select) {
            const fields = select.split(',').join(' '); // Handle multiple fields
            query = query.select(fields);
        }

        if (req.query.random === 'true') {
            // Return a single random message if 'random=true' is passed in the query parameters
            const randomMessage = await getRandomMessage();
            return res.status(200).json({
                status: 200,
                statusText: 'OK',
                message: 'Random love message retrieved successfully',
                data: randomMessage[0] // Return the first (and only) element from the array
            });
        } else {
            // Return all messages if no 'random=true' query parameter is passed
            const pickupLines = await query;
            return res.status(200).json({
                status: 200,
                statusText: 'OK',
                message: 'All love messages retrieved successfully',
                data: pickupLines
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            statusText: 'Error',
            message: 'Error retrieving love messages',
            error: error.message
        });
    }
};


const getAllCategories = async (req, res) => {
    try {
        // Get all unique categories from the 'category' field
        const categories = await Message.distinct('category');
        return res.status(200).json({
            status: 200,
            statusText: 'OK',
            message: 'All categories retrieved successfully',
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            statusText: 'Error',
            message: 'Error retrieving categories',
            error: error.message
        });
    }
};

// Create a new message
const createMessage = async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json({
            status: 201,
            statusText: 'Created',
            message: 'Love message created successfully',
            data: newMessage
        });
    } catch (error) {
        res.status(400).json({
            status: 400,
            statusText: 'Bad Request',
            message: 'Error creating love message',
            error: error.message
        });
    }
};

// Get an existing message by ID
const getMessageById = async (req, res) => {
    const { id } = req.params; // Extract the ID from the route parameters

    // Validate ID format
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            status: 400,
            statusText: 'Bad Request',
            message: 'Invalid message ID format',
        });
    }

    try {
        // Find the message by its ID
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({
                status: 404,
                statusText: 'Not Found',
                message: 'Message not found',
            });
        }
        return res.status(200).json({
            status: 200,
            statusText: 'OK',
            message: 'Message retrieved successfully',
            data: message,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            statusText: 'Error',
            message: 'Error retrieving message',
            error: error.message,
        });
    }
};

// Update an existing message by ID
const updateMessage = async (req, res) => {
    const { id } = req.params; // Get the message ID from the URL parameters

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            status: 400,
            statusText: 'Bad Request',
            message: 'Invalid message ID format',
        });
    }

    try {
        const updatedMessage = await Message.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedMessage) {
            return res.status(404).json({
                status: 404,
                statusText: 'Not Found',
                message: 'Love message not found'
            });
        }
        res.status(200).json({
            status: 200,
            statusText: 'OK',
            message: 'Love message updated successfully',
            data: updatedMessage
        });
    } catch (error) {
        res.status(400).json({
            status: 400,
            statusText: 'Bad Request',
            message: 'Error updating love message',
            error: error.message
        });
    }
};

// Delete a message by ID
const deleteMessage = async (req, res) => {
    const { id } = req.params; // Get the message ID from the URL parameters

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            status: 400,
            statusText: 'Bad Request',
            message: 'Invalid message ID format',
        });
    }
    
    try {
        const deletedMessage = await Message.findByIdAndDelete(id);
        if (!deletedMessage) {
            return res.status(404).json({
                status: 404,
                statusText: 'Not Found',
                message: 'Love message not found'
            });
        }
        res.status(200).json({
            status: 200,
            statusText: 'OK',
            message: 'Love message deleted successfully',
            data: deletedMessage
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            statusText: 'Error',
            message: 'Error deleting love message',
            error: error.message
        });
    }
};

const getAllMessagesTesting = async(req, res) => {
    try {
        const pickupLines = await Message.find({});
        return res.status(200).json({
            status: 200,
            statusText: 'OK',
            message: 'Love messages retrieved successfully',
            data: pickupLines
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            statusText: 'Error',
            message: 'Error retrieving love messages',
            error: error.message
        });
    }
};

module.exports = { getMessage, getAllCategories, createMessage, getMessageById, updateMessage, deleteMessage, getAllMessagesTesting };
