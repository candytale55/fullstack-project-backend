/* Defines language documents referenced by courses and loaded by language.controller. */

import mongoose from "mongoose";

// Describes the values shared by Mongoose documents and controllers. `code` is the
// stable programmatic identifier, while the two names are display labels.
export interface ILanguage {
    name: string;           // in Spanish (e.g. Portugués)
    nativeName: string;     // (e.g. Português)
    code: string;           // ISO 639-1 language code (pt)
}

// Enforce uniqueness at the database index level so concurrent inserts cannot
// create duplicate languages even if both requests pass controller validation.
const languageSchema = new mongoose.Schema<ILanguage>({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nativeName: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    }
}, {
    timestamps: true
});

const Language = mongoose.model<ILanguage>(
    "Language",
    languageSchema,
    "languages" // collection name in MongoDB
);

export default Language;