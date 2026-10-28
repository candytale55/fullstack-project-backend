/* Defines exercise documents consumed by exercise.controller and learning pages. */

import mongoose, {
    Schema,
    Types
} from "mongoose";


/* --------- Exercise Types --------- */
// This tuple is the single source of truth for both TypeScript and Mongoose:
// the derived union protects application code, and the enum rejects invalid data.

export const EXERCISE_TYPES = [
    "vocabulary",
    "conjugation",
    "quiz",
    "multiple-choice",
    "fill-blank",
    "matching",
    "crossword",
    "word-search"
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

/* ----------------------------------- */

export interface IExercise {
    // `unitId` references an embedded IUnit _id, not a separate MongoDB collection.
    course: Types.ObjectId;
    unitId?: Types.ObjectId;

    title: string;
    description?: string;

    type: ExerciseType;
    order: number;

    vocabularyItems: Types.ObjectId[];
}


// Defines the persisted validation rules. Controller request types improve developer
// tooling, but this schema is the final validation boundary for database writes.
const exerciseSchema = new Schema<IExercise>(
    {
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        unitId: {
            type: Schema.Types.ObjectId
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        type: {
            type: String,
            enum: EXERCISE_TYPES,
            required: true
        },

        order: {
            type: Number,
            required: true,
            min: 1
        },

        // An exercise can reference several vocabulary records; populate() resolves
        // these ids when a learning screen needs the complete words.
        vocabularyItems: [
            {
                type: Schema.Types.ObjectId,
                ref: "VocabularyItem"
            }
        ]
    },
    {
        timestamps: true
    }
);


const Exercise = mongoose.model<IExercise>(
    "Exercise",
    exerciseSchema,
    "exercises"
);


export default Exercise;
