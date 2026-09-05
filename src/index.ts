import express, { Request, Response } from "express";
import dotenv from "dotenv";

// Loads .env variables into process.env.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware that parses JSON request bodies (req.body).
// Without this, POST/PUT requests with JSON arrive as undefined.
app.use(express.json());

// Health check - Open http://localhost:3000 to test
// TODO: Eliminate once real routes are implemented.
app.get("/", (_req: Request, res: Response) => {
    res.json({ message: "Hello World! 🌍 El backend está funcionando." });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
