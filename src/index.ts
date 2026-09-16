import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db";
import User from "./api/models/User.model";

import usersRouter from "./api/routes/users.routes";
import authRouter from "./api/routes/auth.routes";

// Loads .env variables into process.env.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware that parses JSON request bodies (req.body).
// Without this, POST/PUT requests with JSON arrive as undefined.
app.use(express.json());

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);

// Connect to the database
connectDB();

// TODO: Log the User model name and collection name for debugging purposes - Remove this after verifying the model.
console.log("Testing model name:", User.modelName);
console.log("Testing collection name:", User.collection.name);

// Health check - Open http://localhost:3000 to test
// TODO: Eliminate once real routes are implemented.
app.get("/", (_req, res) => {
    res.json({ message: "Hello World! 🌍 El backend está funcionando." });
});

// 404 handler - Must be after all other routes.
app.use((_req, res) => { 
    return res.status(404).json("Route not found");
});

// Start the server and listen on the specified port.
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

