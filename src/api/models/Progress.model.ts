/* Defines learner progress records read and updated by progress.controller. */

import mongoose, {
    Schema,
    Types
} from "mongoose";


export interface IProgress {
    user: Types.ObjectId;
    course: Types.ObjectId;
    completedSessions: number;
    completedExercises: Types.ObjectId[];
    questionsAnswered: number;
    correctAnswers: number;
    lastStudiedAt?: Date;
    studyDays: string[];
}


const progressSchema = new Schema<IProgress>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        completedSessions: {
            type: Number,
            default: 0
        },

        questionsAnswered: {
            type: Number,
            default: 0
        },

        correctAnswers: {
            type: Number,
            default: 0
        },

        lastStudiedAt: {
            type: Date
        },

        // Stores unique study dates as YYYY-MM-DD strings for future heat maps.
        studyDays: {
            type: [String],
            default: []
        },

        completedExercises: [
            {
                type: Schema.Types.ObjectId,
                ref: "Exercise"
            }
        ]
    },
    {
        timestamps: true
    }
);


// Ensure that each user can have only one progress record per course.
progressSchema.index(
    {
        user: 1,
        course: 1
    },
    {
        unique: true
    }
);


const Progress = mongoose.model<IProgress>(
    "Progress",
    progressSchema,
    "progresses"
);


export default Progress;