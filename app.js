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