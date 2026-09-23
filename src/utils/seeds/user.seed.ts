/*
 * Seeds the initial admin and regular users.
 * Existing users are preserved so their related progress records remain valid.
 */

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import { connectDB } from "../../config/db";
import User from "../../api/models/User.model";


dotenv.config();


type UserSeed = {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
};


const seedUsers = async () => {
    try {
        await connectDB();


        const filePath = path.resolve(
            __dirname,
            "data/users.json"
        );


        const fileContent = fs.readFileSync(
            filePath,
            "utf-8"
        );


        const users: UserSeed[] =
            JSON.parse(fileContent);


        for (const userData of users) {

            const existingUser = await User.findOne({
                email: userData.email
            });


            if (existingUser) {

                /*
                 * Keep the existing document and ObjectId
                 * so related progress records remain valid.
                 *
                 * Name and role may still be synchronized
                 * with the seed data.
                 */
                existingUser.name = userData.name;
                existingUser.role = userData.role;

                await existingUser.save();

                console.log(
                    `User already exists: ${userData.email}`
                );

                continue;
            }


            await User.create(userData);

            console.log(
                `User created: ${userData.email}`
            );
        }


        console.log(
            `${users.length} users processed`
        );

    } catch (error) {

        console.error(
            "Error seeding users:",
            error
        );

        process.exitCode = 1;

    } finally {

        await mongoose.connection.close();

        console.log(
            "Database connection closed"
        );
    }
};


seedUsers();