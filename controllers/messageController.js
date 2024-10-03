const Message = require("../models/message");

// Function to get a single random message
const getRandomMessage = async () => {
    return await Message.aggregate([{ $sample: { size: 1 } }]);
};

const getMessage = async(req, res) => {
    try {
        // Validate 'category' if it's present in the query
        if (req.query.category) {
            const validCategories = await Message.distinct('category');
            if (!validCategories.includes(req.query.category)) {
                return res.status(400).json({
                    status: 400,
                    statusText: 'Bad Request',
                    message: `Invalid category: ${req.query.category}`,
                });
            }
        }

        // Validate 'featured' if it's present in the query
        if (req.query.featured && !['true', 'false'].includes(req.query.featured)) {
            return res.status(400).json({
                status: 400,
                statusText: 'Bad Request',
                message: `'featured' must be either 'true' or 'false'`,
            });
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
            const pickupLines = await Message.find(req.query);
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

// Update an existing message by ID
const updateMessage = async (req, res) => {
    const { id } = req.params; // Get the message ID from the URL parameters
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

module.exports = { getMessage, getAllCategories, createMessage, updateMessage, deleteMessage, getAllMessagesTesting };
