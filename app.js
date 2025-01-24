require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const app = express();
const connectDB = require("./db/connect");

const PORT = process.env.PORT || 5000;

const lines_routes = require("./routes/messages");

// Swagger configuration
const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Love Messages API",
        version: "1.0.0",
        description: "API for retrieving, creating, updating, and deleting love messages.",
      },
      servers: [
        {
            url: "http://localhost:5000", 
            description: "Local server",
        },
      ],
    },
    apis: ["./swagger/*.js"],
  };
  
  // Initialize swagger-jsdoc
  const swaggerDocs = swaggerJSDoc(swaggerOptions);

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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