/* Maps course URLs to course.controller operations used by the frontend services. */

import { Router } from "express";

import {
    getAllCourses,
    getCoursesByLanguage,
    getCourse,
    getCourseUnits,
    createCourse,
    updateCourse,
    deleteCourse
} from "../controllers/course.controller";


// Mounted at /api/v1/courses. Specific multi-segment routes are declared before
// "/:id" so Express does not treat words such as "language" as an id parameter.
const coursesRouter = Router();

coursesRouter.get("/", getAllCourses);

// Retrieves only the embedded units; it avoids sending the full course document
// when a unit-navigation view does not need its other metadata.
coursesRouter.get(
    "/language/:languageId",
    getCoursesByLanguage
);

coursesRouter.get(
    "/:id/units",
    getCourseUnits
);

coursesRouter.get("/:id", getCourse);

coursesRouter.post("/", createCourse);

coursesRouter.patch("/:id", updateCourse);

coursesRouter.delete("/:id", deleteCourse);

export default coursesRouter;