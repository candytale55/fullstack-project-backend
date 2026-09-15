import type { Request, Response } from "express";
import bcrypt from "bcrypt";

import User from "../models/User.model";
import { generateToken } from "../../utils/jwt";



/* ------------------------------------------------ */
/* -------- Register, Login, Logout --------------- */
/* ------------------------------------------------ */


// Helper function to extract error messages from exceptions.
// con strict: true, TypeScript considera el error de catch como unknown, por lo que necesitamos esta función para extraer el mensaje de error.
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
}; // No role, as users cannot set their role during registration.


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

        // Check if the user already exists.
        const userDuplicated = await User.findOne({
            email: normalizedEmail
        });

        if (userDuplicated) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

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

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Check if the provided password matches the stored password hash.
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(
            user._id.toString()
        );

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





// ---------------- Export Controllers --------------------

export {
    register, 
    login
};