/* Creates the API server, connects shared routes, and starts the HTTP listener. */

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { connectCloudinary } from "./config/cloudinary";

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

// Load configuration before constructing any service that reads process.env.
// cloudinary.ts also loads dotenv so seed scripts can use it independently.
dotenv.config();
connectCloudinary();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin))

// Send CORS headers only to the configured frontend and the local Vite server.
// Browsers enforce this restriction; non-browser clients are unaffected by CORS.
app.use(cors({
    origin: allowedOrigins,
}));

// Middleware that parses JSON request bodies (req.body).
// Without this, POST/PUT requests with JSON arrive as undefined.
app.use(express.json());


// This unauthenticated health endpoint is useful to verify that the HTTP process is
// alive independently of any resource-specific route.
app.get("/", (_req, res) => {
    res.json({ message: "Backend is running" });
});

// Mount routers under versioned prefixes. Paths declared inside each router are
// relative to these prefixes, for example authRouter's "/login" becomes
// POST /api/v1/auth/login.
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

// This must stay after every router so it only handles requests that no route owns.
app.use((_req, res) => {
    return res.status(404).json("Route not found");
});

/* Start accepting requests only after MongoDB is ready. */
const startServer = async () => {
    // Do not accept requests before the shared Mongoose connection is established;
    // controllers depend on it for every database operation.
    await connectDB();

    app.listen(PORT, () => {
        console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Failed to start the server:", error);
    process.exit(1);
});
