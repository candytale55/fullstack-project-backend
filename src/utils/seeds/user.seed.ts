// Script to seed users (admin and regular) into the database (for development purposes)

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

        // Previous approach kept for reference only:
        // const existingAdmin = await User.findOne({
        //     email: "admin@example.com"
        // });
        //
        // if (existingAdmin) {
        //     console.log("Admin user already exists.");
        // } else {
        //     const adminUser = await User.create({
        //         name: "Test Admin",
        //         email: "admin@example.com",
        //         password: "Admin@12345",
        //         role: "admin"
        //     });
        //
        //     console.log("Admin user created successfully.");
        //     console.log(adminUser);
        // }
        //
        // const existingUser = await User.findOne({
        //     email: "user@example.com"
        // });
        //
        // if (existingUser) {
        //     console.log("Regular user already exists.");
        // } else {
        //     const regularUser = await User.create({
        //         name: "Test User",
        //         email: "user@example.com",
        //         password: "User@12345",
        //         role: "user"
        //     });
        //
        //     console.log("Regular user created successfully.");
        //     console.log(regularUser);
        // }

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