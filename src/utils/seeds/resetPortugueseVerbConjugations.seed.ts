/*
 * Temporary manual reset for Portuguese verb conjugation imports.
 *
 * Run only when explicitly needed:
 *   npm run reset:ptverbs
 *
 * This drops the complete `portugueseVerbConjugations` collection, including its
 * indexes. It is intentionally not imported by master.seed.ts or the normal
 * conjugation seed, so routine seeding can never erase the collection this way.
 */

import mongoose from "mongoose";

import { connectDB } from "../../config/db";


const COLLECTION_NAME = "portugueseVerbConjugations";

// Drops the exact collection used by PortugueseVerbConjugation and leaves every
// other MongoDB collection untouched. Do not import the model here: doing so can
// trigger Mongoose's automatic index creation before this cleanup executes.
const resetPortugueseVerbConjugations = async () => {
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
        console.error(
            "Error resetting Portuguese verb conjugations:",
            error
        );
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
};

// Keep importing this helper safe. `tsx` executes the reset only when this file is
// the command entry point, which is the case for `npm run reset:ptverbs`.
if (require.main === module) {
    void resetPortugueseVerbConjugations();
}

export { resetPortugueseVerbConjugations };
