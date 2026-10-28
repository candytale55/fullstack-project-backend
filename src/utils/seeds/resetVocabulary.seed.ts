/*
 * Temporary manual reset for vocabulary imports.
 *
 * Run only when explicitly needed:
 *   npm run reset:vocabulary
 *
 * This drops the complete `vocabulary` collection, including its indexes. It does
 * not delete Cloudinary assets and is intentionally excluded from master.seed.ts
 * and the normal vocabulary seed.
 */

import mongoose from "mongoose";

import { connectDB } from "../../config/db";


const COLLECTION_NAME = "vocabulary";

// Drops only the database collection owned by VocabularyItem. Cloudinary is kept
// untouched: vocabulary.seed.ts resolves the stable remote image ID on the next
// import, allowing repeated resets and seeds without creating another asset.
const resetVocabulary = async () => {
    try {
        await connectDB();

        const database = mongoose.connection.db;

        if (!database) {
            throw new Error("MongoDB database connection is not available");
        }

        const collections = await database
            .listCollections({ name: COLLECTION_NAME })
            .toArray();

        if (collections.length === 0) {
            console.log(
                `${COLLECTION_NAME} does not exist; nothing to reset`
            );
            return;
        }

        await database.dropCollection(COLLECTION_NAME);

        console.log(
            `${COLLECTION_NAME} collection and its indexes were deleted`
        );
    } catch (error) {
        console.error("Error resetting vocabulary:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
};

// Keep importing this helper safe. It runs only when this file is the command entry
// point, which is the case for `npm run reset:vocabulary`.
if (require.main === module) {
    void resetVocabulary();
}

export { resetVocabulary };
