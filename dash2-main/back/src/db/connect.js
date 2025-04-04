const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb+srv://Eons:abcd1234@cluster0.4hb7y4t.mongodb.net/certificateDB";
        
        await mongoose.connect(uri);
        console.log("Connected to DB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit if database connection fails
    }
}

module.exports = connectDB;
