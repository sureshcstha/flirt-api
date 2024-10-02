const mongoose = require("mongoose");

const connectDB = async (uri) => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully!");
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;