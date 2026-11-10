/* Starts the Express API for local and traditional Node deployments. */

import dotenv from "dotenv";
import { connectDB } from "./config/db";
import app from "./app";

dotenv.config();
const PORT = process.env.PORT || 3000;

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
