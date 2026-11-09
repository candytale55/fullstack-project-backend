/* Maps course URLs to course.controller operations used by the frontend services. */

import { Router } from "express";
import { isAuth } from "../../middlewares/isAuth";
import { isAdmin } from "../../middlewares/isAdmin";

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

coursesRouter.post(
    "/",
    isAuth,
    isAdmin,
    createCourse
);

coursesRouter.patch(
    "/:id",
    isAuth,
    isAdmin,
    updateCourse
);

coursesRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    deleteCourse
);

export default coursesRouter;