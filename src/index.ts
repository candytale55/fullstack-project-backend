/* Creates the API server, connects shared routes, and starts the HTTP listener. */

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";


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
import portugueseVerbConjugationRouter from "./api/routes/PortugueseVerbConjugation.routes";

/* ========================================== */

// Loads .env variables into process.env.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin))

// Enable CORS for all routes
app.use(cors({
    origin: allowedOrigins,
}));

// Middleware that parses JSON request bodies (req.body).
// Without this, POST/PUT requests with JSON arrive as undefined.
app.use(express.json());


/* Register routes before waiting for the database connection. */
app.get("/", (_req, res) => {
    res.json({ message: "Backend is running" });
});

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/languages", languagesRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/vocabulary", vocabularyRouter);
app.use("/api/v1/exercises", exercisesRouter);
app.use("/api/v1/progress", progressRouter);
app.use(
    "/api/v1/portuguese-verb-conjugations",
    portugueseVerbConjugationRouter
);

app.use((_req, res) => {
    return res.status(404).json("Route not found");
});

/* Start accepting requests only after MongoDB is ready. */
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Failed to start the server:", error);
    process.exit(1);
});

