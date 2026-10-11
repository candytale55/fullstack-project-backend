/*
 * src/api/models/Course.model.ts
 *
 * Defines courses and their embedded units.
 * Courses reference a Language and provide stable codes used by seeds,
 * vocabulary imports, and frontend navigation.
 */

import mongoose, { Types, Schema } from 'mongoose'


// Units are subdocuments: their ObjectIds are generated inside the parent course
// and are later referenced by exercises and progress as `unitId`.
export interface IUnit {
    _id?: Types.ObjectId;
    code: string;
    title: string;
    description?: string;
    order: number;
}


// Course documents either organize content as embedded units or as a flat list of
// exercises. The controller enforces the relationship between structure and units.
export interface ICourse {
    code: string;
    language: Types.ObjectId;

    title: string;
    level: string;
    description?: string;

    structure: "units" | "exercises";

    units: IUnit[];
}


// `_id` remains enabled for each unit so an exercise can point to a stable unit.
const unitSchema = new Schema<IUnit>(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
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

        order: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        _id: true
    }
);


const courseSchema = new Schema<ICourse>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        language: {
            type: Schema.Types.ObjectId,
            ref: "Language",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        level: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        structure: {
            type: String,
            enum: ["units", "exercises"],
            required: true
        },

        units: {
            type: [unitSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);


// Prevent duplicate course titles within one language while still allowing the same
// title for courses in different languages.
courseSchema.index(
    {
        language: 1,
        title: 1
    },
    {
        unique: true
    }
);


const Course = mongoose.model<ICourse>(
    "Course",
    courseSchema,
    "courses"
);

export default Course;