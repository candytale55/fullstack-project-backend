/* Defines language documents referenced by courses and loaded by language.controller. */

import mongoose from "mongoose";

// Defines the structure.
export interface ILanguage {
    name: string;           // in Spanish (e.g. Portugués)
    nativeName: string;     // (e.g. Português)
    code: string;           // ISO 639-1 language code (pt)
}

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