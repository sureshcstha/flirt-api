require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const cookieParser = require("cookie-parser");
const app = express();
const connectDB = require("./db/connect");

const PORT = process.env.PORT || 5000;

const lines_routes = require("./routes/messages");
const apiAuthRoutes = require("./routes/apiAuthRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");

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

// cors
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); // Parse JSON request bodies

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hi, I am live.")
});

// middleware
app.use("/messages", lines_routes);
app.use("/api/auth", apiAuthRoutes);
app.use("/users", userAuthRoutes);

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