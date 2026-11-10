/* Configures the Express application without opening a network listener. */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import usersRouter from "./api/routes/users.routes";
import authRouter from "./api/routes/auth.routes";
import languagesRouter from "./api/routes/languages.routes";
import coursesRouter from "./api/routes/courses.routes";
import vocabularyRouter from "./api/routes/vocabulary.routes";
import exercisesRouter from "./api/routes/exercises.routes";
import progressRouter from "./api/routes/progress.routes";
import portugueseVerbConjugationRouter from "./api/routes/PortugueseVerbConjugation.routes";

dotenv.config();

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
    origin: allowedOrigins,
}));

app.use(express.json());

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

export default app;
