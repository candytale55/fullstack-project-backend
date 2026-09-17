import mongoose, { Types, Schema } from 'mongoose'


// Defines the structure
export interface IUnit {
    title: string;
    description?: string;
    order: number;
}

// Defines the structure
export interface ICourse {
    language: Types.ObjectId;

    title: string;
    level: string;
    description?: string;

    structure: "units" | "exercises";

    units: IUnit[];
}


const unitSchema = new Schema<IUnit>(
    {
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