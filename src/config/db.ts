/* Connects the API and seed scripts to MongoDB through the shared MONGO_URI setting. */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in the environment variables.");
        }
        await mongoose.connect(mongoURI);
        console.log("Connected to the database successfully.");

    } catch (error) {
        console.error("Failed to connect to the database.", error);
        throw error;
    }
}


