/* Provides user CRUD operations consumed by the user routes and protected admin flows. */

import type { Request, Response } from "express";
import User from "../models/User.model";


/* ------------------------------------------------ */
/* -------- Basic CRUD operations for User -------- */
/* ------------------------------------------------ */


const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(400).json({ error: "Failed to get all users" });
    }
}


/* ---- get a single User by ID ---- */

const getUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(user);

    } catch (error) {
        return res.status(400).json({ error: "Failed to get user" });
    }
}


/* ---- create a new User ---- */

type CreateUserBody = {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin";
};

const createUser = async (
    req: Request<{}, {}, CreateUserBody>, //req.body must comply with CreateUserBody.
    res: Response) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        return res.status(201).json(newUser);
    } catch (error) {
        return res.status(400).json({ error: "Failed to create user" });
    }
}

/* ---- update an existing User ---- */

type UpdateUserBody = {
    name?: string;
    email?: string;
};

const updateUser = async (
    req: Request<{ id: string }, {}, UpdateUserBody>,
    res: Response
) => { 
    try {
        const { id } = req.params;

        const updateData: UpdateUserBody = {};
        
        if (req.body.name !== undefined) {
            updateData.name = req.body.name;
        }
        if (req.body.email !== undefined) {
            updateData.email = req.body.email;
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "Cannot update fields provided for update"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");
        
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        return res.status(400).json({ error: "Failed to update user" });
    }
}

/* ---- delete an existing User ---- */

const deleteUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const deletedUser = await User.findByIdAndDelete(id);
        return res.status(200).json({ message: `User ${user.name} deleted successfully` });
    } catch (error) {
        return res.status(400).json({ error: "Failed to delete user" });
    }
}

export {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};