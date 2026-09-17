import mongoose, {
    Schema,
    Types
} from "mongoose";


export interface IProgress {
    user: Types.ObjectId;
    course: Types.ObjectId;

    completedExercises: Types.ObjectId[];
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
    "progresses" // TODO: Check name
);


export default Progress;