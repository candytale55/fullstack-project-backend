import type { Request, Response } from "express";

import app from "../src/app";
import { connectDB } from "../src/config/db";

export default async function handler(
    req: Request,
    res: Response
) {
    try {
        await connectDB();
        app(req, res);
    } catch (error: unknown) {
        console.error("Failed to initialize the API:", error);
        res.status(500).json({ message: "Failed to initialize the API" });
    }
}
