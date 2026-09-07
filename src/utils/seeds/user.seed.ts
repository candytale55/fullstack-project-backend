// Script to seed the admin user into the database (for development purposes)

import dotenv from "dotenv";
import { connectDB } from "../../config/db";
import User from "../../api/models/User.model";

// Load environment variables from .env file
dotenv.config();

const seedAdminUser = async () => {
    try {
        
        // Connect to the database before seeding the admin user
        await connectDB();

        // Check if the admin user already exists before creating a new one
        const existingAdmin = await User.findOne({
            email: "admin@example.com"
        });

        if (existingAdmin) { 
            console.log("Admin user already exists.");
            process.exit(0);
        }

        // Create the admin user if it doesn't exist
        const adminUser = await User.create({
            name: "Test Admin",
            email: "admin@example.com",
            password: "Admin@12345",
            role: "admin"
        });

        console.log("Admin user created successfully.");
        console.log(adminUser);

        // Exit the process after seeding the admin user successfully
        process.exit(0);


    } catch (error) {
        console.error("Error seeding Admin user:", error);
        process.exit(1); 
    }
}

seedAdminUser();