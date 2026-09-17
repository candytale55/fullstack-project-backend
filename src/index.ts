import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db";
import User from "./api/models/User.model";


/* ========================================== */
/*           Import Routes                    */
/* ========================================== */

import usersRouter from "./api/routes/users.routes";
import authRouter from "./api/routes/auth.routes";

import languagesRouter from "./api/routes/languages.routes";
import coursesRouter from "./api/routes/courses.routes";
import vocabularyRouter from "./api/routes/vocabulary.routes";
import exercisesRouter from "./api/routes/exercises.routes";
import progressRouter from "./api/routes/progress.routes";

/* ========================================== */

// Loads .env variables into process.env.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware that parses JSON request bodies (req.body).
// Without this, POST/PUT requests with JSON arrive as undefined.
app.use(express.json());


// Connect to the database
connectDB();

// Open http://localhost:3000 to test
app.get("/", (_req, res) => {
    res.json({ message: "Backend is running" });
});

/* ===========AUTH & USERS ROUTES============ */
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);

/* ======= COURSE AND LANGUAGE ROUTES========= */
app.use("/api/v1/languages", languagesRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/vocabulary", vocabularyRouter);
app.use("/api/v1/exercises", exercisesRouter);
app.use("/api/v1/progress", progressRouter);

// 404 handler - Must be after all other routes.
app.use((_req, res) => { 
    return res.status(404).json("Route not found");
});

// Start the server and listen on the specified port.
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

