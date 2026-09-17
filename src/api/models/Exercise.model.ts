// TODO: PROVISIONAL - Revisar antes de cargar los datos.

import mongoose, {
    Schema,
    Types
} from "mongoose";


/* --------- Exercise Types --------- */
// Add / Change exercise types only here:

export const EXERCISE_TYPES = [
    "quiz",
    "multiple-choice",
    "fill-blank",
    "matching"
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

/* ----------------------------------- */

export interface IExercise {
    course: Types.ObjectId;
    unitId?: Types.ObjectId;

    title: string;
    description?: string;

    type: ExerciseType;
    order: number;

    vocabularyItems: Types.ObjectId[];
}


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
