require("dotenv").config();
const connectDB = require("./db/connect");
const Message = require("./models/message");

const MessageJson = require("./messages.json");

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URL);
        await Message.deleteMany();
        await Message.create(MessageJson);
        console.log("success");
    } catch (error) {
        console.log(error);
    }
}

start();