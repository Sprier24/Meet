const express = require("express");
const connectDB = require("./db/connect");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const routes = require("./routes/api/v1/index");

const app = express();

// Configure CORS to accept requests from any origin during development
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend origin
    credentials: true
}));

// Increase JSON payload limit for large requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Ensure services directory exists
try {
    const servicesDir = path.join(process.cwd(), "services");
    if (!fs.existsSync(servicesDir)) {
        fs.mkdirSync(servicesDir, { recursive: true });
        console.log("Created services directory");
    }
} catch (error) {
    console.error("Error creating services directory:", error);
}

// Connect to database
connectDB().then(() => {
    app.use("/api/v1", routes);

    app.listen(5000, () => {
        console.log(`Server running on port 5000`);
    });
}).catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
