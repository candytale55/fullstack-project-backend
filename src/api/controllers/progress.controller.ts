/* Reads and updates learner progress records exposed through progress routes. */

import type { Request, Response } from "express";

import Progress from "../models/Progress.model";

/* ------------------------------------- */
/*           Progress Controllers        */
/* ------------------------------------- */

const getAllProgress = async (
    _req: Request,
    res: Response
) => {
    try {
        const progress = await Progress
            .find()
            .populate(
                "user",
                "name email"
            )
            .populate(
                "course",
                "title level"
            )
            .populate(
                "completedExercises",
                "title type"
            );

        return res.status(200).json(progress);

    } catch {
        return res.status(400).json({
            error: "Failed to get progress"
        });
    }
};

/* ========================================== */

const getProgress = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const progress = await Progress
            .findById(req.params.id)
            .populate(
                "course",
                "title level"
            )
            .populate(
                "completedExercises",
                "title type"
            );

        if (!progress) {
            return res.status(404).json({
                error: "Progress not found"
            });
        }

        return res.status(200).json(progress);

    } catch {
        return res.status(400).json({
            error: "Failed to get progress"
        });
    }
};


/* ========================================== */

const getUserCourseProgress = async (
    req: Request<{
        userId: string;
        courseId: string;
    }>,
    res: Response
) => {
    try {
        const progress = await Progress
            .findOne({
                user: req.params.userId,
                course: req.params.courseId
            })
            .populate(
                "course",
                "title level"
            )
            .populate(
                "completedExercises",
                "title type"
            );

        if (!progress) {
            return res.status(404).json({
                error: "Progress not found"
            });
        }

        return res.status(200).json(progress);

    } catch {
        return res.status(400).json({
            error: "Failed to get progress"
        });
    }
};


/* ========================================== */

type CreateProgressBody = {
    user: string;
    course: string;
};

const createProgress = async (
    req: Request<{}, {}, CreateProgressBody>,
    res: Response
) => {
    try {
        const progress = await Progress.create({
            user: req.body.user,
            course: req.body.course,
            completedExercises: []
        });

        return res.status(201).json(progress);

    } catch {
        return res.status(400).json({
            error: "Failed to create progress"
        });
    }
};


/* ========================================== */

const completeExercise = async (
    req: Request<{
        userId: string;
        courseId: string;
        exerciseId: string;
    }>,
    res: Response
) => {
    try {
        const progress = await Progress.findOneAndUpdate(
            {
                user: req.params.userId,
                course: req.params.courseId
            },
            {
                $addToSet: {
                    completedExercises:
                        req.params.exerciseId
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return res.status(200).json(progress);

    } catch {
        return res.status(400).json({
            error: "Failed to complete exercise"
        });
    }
};

/* ========================================== */

const resetProgress = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const progress = await Progress.findByIdAndUpdate(
            req.params.id,
            {
                completedExercises: []
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!progress) {
            return res.status(404).json({
                error: "Progress not found"
            });
        }

        return res.status(200).json(progress);

    } catch {
        return res.status(400).json({
            error: "Failed to reset progress"
        });
    }
};

/* ========================================== */

const deleteProgress = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const progress =
            await Progress.findByIdAndDelete(
                req.params.id
            );

        if (!progress) {
            return res.status(404).json({
                error: "Progress not found"
            });
        }

        return res.status(200).json({
            message: "Progress deleted successfully"
        });

    } catch {
        return res.status(400).json({
            error: "Failed to delete progress"
        });
    }
};

/* ========================================== */

export {
    getAllProgress,
    getProgress,
    getUserCourseProgress,
    createProgress,
    completeExercise,
    resetProgress,
    deleteProgress
};