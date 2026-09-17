// TODO: PROVISIONAL - Revisar antes de cargar los datos.

import mongoose, { Schema, Types } from "mongoose";

export interface IVocabularyItem {
    course: Types.ObjectId;
    unitId?: Types.ObjectId;

    term: string;
    level?: string;
    partOfSpeech?: string;

    definition: string;
    clozeExample?: string;

    tags: string[];
    sourceReference?: string;
}

const vocabularySchema =
    new Schema<IVocabularyItem>(
        {
            course: {
                type: Schema.Types.ObjectId,
                ref: "Course",
                required: true
            },

            unitId: {
                type: Schema.Types.ObjectId
            },

            term: {
                type: String,
                required: true,
                trim: true
            },

            level: {
                type: String,
                trim: true
            },

            partOfSpeech: {
                type: String,
                trim: true
            },

            definition: {
                type: String,
                required: true,
                trim: true
            },

            clozeExample: {
                type: String,
                trim: true
            },

            tags: {
                type: [String],
                default: []
            },

            sourceReference: {
                type: String,
                trim: true
            }
        },
        {
            timestamps: true
        }
    );


const VocabularyItem =
    mongoose.model<IVocabularyItem>(
        "VocabularyItem",
        vocabularySchema,
        "vocabulary"
    );


export default VocabularyItem;