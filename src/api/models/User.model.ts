import mongoose from "mongoose";

// User schema definition for MongoDB using Mongoose.
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true,  trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

// Create the User model based on the schema.
const User = mongoose.model("User", userSchema, "users");


export default User;