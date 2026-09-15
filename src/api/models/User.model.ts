import mongoose from "mongoose";
import bcrypt from "bcrypt";


export interface IUser {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin";
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

// Hash password before saving.
userSchema.pre("save", async function () {

    // TODO: Remove debug logs before deploying to production.
    console.log("[User pre-save] Hook executed");
    console.log(
        "[User pre-save] Password modified:",
        this.isModified("password")
    );

    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compile the model AFTER adding middleware.
const User = mongoose.model<IUser>("User", userSchema, "users");

export default User;