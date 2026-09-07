// Configuración de la conexión a la base de datos MongoDB.

import mongoose from "mongoose";

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
        process.exit(1);
    }
}


