require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./db/connect");

const PORT = process.env.PORT || 5000;

const lines_routes = require("./routes/messages");

app.get("/", (req, res) => {
    res.send("Hi, I am live.")
});

// middleware
app.use("/api/messages", lines_routes);

// Catch-all middleware for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        statusText: 'Not Found',
        message: 'The requested resource was not found on this server'
    });
});

const start = async() => {
    try {
        await connectDB(process.env.MONGODB_URL);
        app.listen(PORT, () => {
            console.log(`Node server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();