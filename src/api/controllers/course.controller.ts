import type { Request, Response } from "express";

import Course from "../models/Course.model";

/* ------------------------------------- */
/*           Course Controllers          */
/* ------------------------------------- */

const getAllCourses = async (
    _req: Request,
    res: Response
) => {
    try {
        const courses = await Course
            .find()
            .populate(
                "language",
                "name nativeName code"
            );

        return res.status(200).json(courses);

    } catch {
        return res.status(400).json({
            error: "Failed to get courses"
        });
    }
};


/* ========================================= */

const getCoursesByLanguage = async (
    req: Request<{ languageId: string }>,
    res: Response
) => {
    try {
        const courses = await Course
            .find({
                language: req.params.languageId
            })
            .populate(
                "language",
                "name nativeName code"
            );

        return res.status(200).json(courses);

    } catch {
        return res.status(400).json({
            error: "Failed to get courses"
        });
    }
};


/* ========================================= */

const getCourse = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const course = await Course
            .findById(req.params.id)
            .populate(
                "language",
                "name nativeName code"
            );

        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        return res.status(200).json(course);

    } catch {
        return res.status(400).json({
            error: "Failed to get course"
        });
    }
};

/* ------------------------------------- */
/*           Unit Controllers            */
/* ------------------------------------- */

const getCourseUnits = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const course = await Course.findById(
            req.params.id
        );

        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        if (course.structure !== "units") {
            return res.status(400).json({
                error: "This course does not use units"
            });
        }

        const units = [...course.units].sort(
            (a, b) => a.order - b.order
        );

        return res.status(200).json(units);

    } catch {
        return res.status(400).json({
            error: "Failed to get course units"
        });
    }
};


/* ========================================= */

type CreateCourseBody = {
    language: string;
    title: string;
    level: string;
    description?: string;
    structure: "units" | "exercises";
    units?: {
        title: string;
        description?: string;
        order: number;
    }[];
};

const createCourse = async (
    req: Request<{}, {}, CreateCourseBody>,
    res: Response
) => {
    try {
        if (
            req.body.structure === "exercises" &&
            req.body.units &&
            req.body.units.length > 0
        ) {
            return res.status(400).json({
                error: "A course with exercise structure cannot contain units"
            });
        }

        const course = await Course.create(req.body);

        return res.status(201).json(course);

    } catch {
        return res.status(400).json({
            error: "Failed to create course"
        });
    }
};

/* ========================================= */

type UpdateCourseBody = Partial<CreateCourseBody>;

const updateCourse = async (
    req: Request<{ id: string }, {}, UpdateCourseBody>,
    res: Response
) => {
    try {
        if (
            req.body.structure === "exercises" &&
            req.body.units &&
            req.body.units.length > 0
        ) {
            return res.status(400).json({
                error: "A course with exercise structure cannot contain units"
            });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        return res.status(200).json(course);

    } catch {
        return res.status(400).json({
            error: "Failed to update course"
        });
    }
};


/* ========================================= */

const deleteCourse = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const course = await Course.findByIdAndDelete(
            req.params.id
        );

        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        return res.status(200).json({
            message: `Course ${course.title} deleted successfully`
        });

    } catch {
        return res.status(400).json({
            error: "Failed to delete course"
        });
    }
};

/* ========================================= */

export {
    getAllCourses,
    getCoursesByLanguage,
    getCourse,
    getCourseUnits,
    createCourse,
    updateCourse,
    deleteCourse
};