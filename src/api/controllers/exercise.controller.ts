/* Reads and maintains exercises. Exercise content is validated by Exercise.model,
 * while this layer translates HTTP parameters and database outcomes into responses. */
import type { Request, Response } from "express";

import Exercise from "../models/Exercise.model";


/* ------------------------------------- */
/*         Exercise Controllers          */
/* ------------------------------------- */

const getAllExercises = async (
    _req: Request,
    res: Response
) => {
    try {
        // Populate expands referenced vocabulary only for this complete collection
        // endpoint, avoiding an additional client request per exercise.
        const exercises = await Exercise
            .find()
            .populate(
                "vocabularyItems"
            );

        return res.status(200).json(exercises);

    } catch {
        return res.status(400).json({
            error: "Failed to get exercises"
        });
    }
};

/* ========================================== */

const getExercisesByCourse = async (
    req: Request<{ courseId: string }>,
    res: Response
) => {
    try {
        const exercises = await Exercise
            .find({
                course: req.params.courseId,
                // Exercises without a unit belong directly to courses whose
                // `structure` is "exercises".
                unitId: {
                    $exists: false
                }
            })
            // Persisted order is the curriculum order, not creation order.
            .sort({
                order: 1
            });

        return res.status(200).json(exercises);

    } catch {
        return res.status(400).json({
            error: "Failed to get exercises"
        });
    }
};

/* ========================================== */

const getExercisesByUnit = async (
    req: Request<{
        courseId: string;
        unitId: string;
    }>,
    res: Response
) => {
    try {
        const exercises = await Exercise
            .find({
                course: req.params.courseId,
                unitId: req.params.unitId
            })
            .sort({
                order: 1
            });

        return res.status(200).json(exercises);

    } catch {
        return res.status(400).json({
            error: "Failed to get exercises"
        });
    }
};

/* ========================================== */

const getExercise = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        // The detail response needs full vocabulary records to render an activity.
        const exercise = await Exercise
            .findById(req.params.id)
            .populate("vocabularyItems");

        if (!exercise) {
            return res.status(404).json({
                error: "Exercise not found"
            });
        }

        return res.status(200).json(exercise);

    } catch {
        return res.status(400).json({
            error: "Failed to get exercise"
        });
    }
};

/* ========================================== */

const createExercise = async (
    req: Request,
    res: Response
) => {
    try {
        // Mongoose validates required course, type, order, and ObjectId fields before
        // committing the new exercise.
        const exercise = await Exercise.create(
            req.body
        );

        return res.status(201).json(exercise);

    } catch {
        return res.status(400).json({
            error: "Failed to create exercise"
        });
    }
};

/* ========================================== */

const updateExercise = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const exercise =
            await Exercise.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    // PATCH returns the updated document and must opt into schema
                    // validators because findByIdAndUpdate skips them by default.
                    new: true,
                    runValidators: true
                }
            );

        if (!exercise) {
            return res.status(404).json({
                error: "Exercise not found"
            });
        }

        return res.status(200).json(exercise);

    } catch {
        return res.status(400).json({
            error: "Failed to update exercise"
        });
    }
};

/* ========================================== */

const deleteExercise = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        // A null result means that the syntactically valid id did not identify a
        // document; this is distinct from invalid-id cast errors caught below.
        const exercise =
            await Exercise.findByIdAndDelete(
                req.params.id
            );

        if (!exercise) {
            return res.status(404).json({
                error: "Exercise not found"
            });
        }

        return res.status(200).json({
            message: `Exercise ${exercise.title} deleted successfully`
        });

    } catch {
        return res.status(400).json({
            error: "Failed to delete exercise"
        });
    }
};

/* ========================================== */

export {
    getAllExercises,
    getExercisesByCourse,
    getExercisesByUnit,
    getExercise,
    createExercise,
    updateExercise,
    deleteExercise
};