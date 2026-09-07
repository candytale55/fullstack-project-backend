import mongoose from "mongoose";

// TypeScript interface for the User model.
export interface IUser {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin";
}


// User schema definition for MongoDB using Mongoose.
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, {
    timestamps: true
});

// Create the User model based on the schema.
const User = mongoose.model<IUser>("User", userSchema, "users");


export default User;