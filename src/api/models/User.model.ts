/* Defines persisted users and hashes passwords before auth.controller stores them. */

import mongoose from "mongoose";
import bcrypt from "bcrypt";


export interface IUser {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin";
    resetPasswordToken?: string | undefined;
    resetPasswordExpires?: Date | undefined;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        // Keep stored email values compatible with the normalized lookup used by
        // login and registration, including accounts created by an administrator.
        lowercase: true,
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
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash only newly assigned passwords. Updating a user's name or email must preserve
// the existing hash, while assigning a password must never save its plain-text form.
userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compile the model AFTER adding middleware.
const User = mongoose.model<IUser>("User", userSchema, "users");

export default User;