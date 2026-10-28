/* Implements authentication endpoints used by the frontend auth services and provider. */

import type { Request, Response } from "express";
import bcrypt from "bcrypt";

import User from "../models/User.model";
import { generateToken } from "../../utils/jwt";



/* ------------------------------------------------ */
/* -------- Register, Login, Logout --------------- */
/* ------------------------------------------------ */


// Converts an unknown value thrown by a library into a safe, displayable message.
// With `strict` enabled, catch values are `unknown`, so their properties cannot
// be read until their type has been checked.
const getErrorMessage = (error: unknown): string => {
    return error instanceof Error
        ? error.message
        : "Unknown error";
};


// ---------------- User Registration --------------

type RegisterBody = {
    name: string;
    email: string;
    password: string;
}; // `role` is intentionally omitted: public registration always creates a learner.


const register = async (
    req: Request<{}, {}, RegisterBody>,
    res: Response
) => {
    try {
        const { name, email, password } = req.body;

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // Query with the normalized value so case and surrounding whitespace
        // cannot be used to create logically duplicate accounts.
        const userDuplicated = await User.findOne({
            email: normalizedEmail
        });

        if (userDuplicated) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // The User model's pre-save hook hashes this plain-text password before
        // MongoDB receives it. Never hash it here as well.
        const newUser = new User({
            name,
            email: normalizedEmail,
            password,
            role: "user"
        });

        const savedUser = await newUser.save();

        const {
            password: _password, // excluded from the response
            ...userWithoutPassword
        } = savedUser.toObject();

        return res.status(201).json({
            message: "User created successfully",
            user: userWithoutPassword
        });

    } catch (error: unknown) {
        return res.status(400).json({
            message: "Couldn't create user",
            error: getErrorMessage(error)
        });
    }
};


// ---------------- User Login --------------------

type LoginBody = {
    email: string;
    password: string;
};


const login = async (
    req: Request<{}, {}, LoginBody>,
    res: Response
) => {
    try {
        const { email, password } = req.body;

        // Validate before calling String methods or bcrypt. Request-body TypeScript
        // types describe well-formed clients; they do not validate runtime input.
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Keep the same response for an absent account and an incorrect password
        // so callers cannot determine which email addresses are registered.
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // bcrypt compares the submitted plain-text password against the one-way
        // hash stored by the User model; the original password cannot be recovered.
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // The token contains only the stable database id. isAuth reloads the user
        // on later requests, so role changes and deleted accounts take effect.
        const token = generateToken(
            user._id.toString()
        );

        // Return the token along with the user data (excluding the password).
        const {
            password: _password,
            ...userWithoutPassword
        } = user.toObject();

        return res.status(200).json({
            token,
            user: userWithoutPassword
        });

    } catch (error: unknown) {
        return res.status(400).json({
            message: "Login error",
            error: getErrorMessage(error)
        });
    }
};


/* ---------------- Get Current User -------------------- */
// isAuth has already verified the token and attached a password-free user object.
// The frontend uses this endpoint to restore an existing session after refresh.

const getCurrentUser = async (
    req: Request,
    res: Response
) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    return res.status(200).json({
        user: req.user
    });
};



// ---------------- Export Controllers --------------------

export {
    register, 
    login,
    getCurrentUser
};