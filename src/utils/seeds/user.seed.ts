/*
 * Seeds the initial admin and regular users into MongoDB.
 * Existing users are cleared first so each run recreates a predictable test state.
 */

import dotenv from "dotenv";
import { connectDB } from "../../config/db";
import User from "../../api/models/User.model";

// Load environment variables from .env file
dotenv.config();

const seedUsers = async () => {
    try {
        await connectDB();

        await User.deleteMany({});
        console.log("All users removed before reseeding.");

        const adminUser = await User.create({
            name: "Test Admin",
            email: "admin@example.com",
            password: "Admin@12345",
            role: "admin"
        });

        console.log("Admin user created successfully.");
        console.log(adminUser);

        const regularUser = await User.create({
            name: "Test User",
            email: "user@example.com",
            password: "User@12345",
            role: "user"
        });

        console.log("Regular user created successfully.");
        console.log(regularUser);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding users:", error);
        process.exit(1); // Exit with failure code on error
    }
};

seedUsers();