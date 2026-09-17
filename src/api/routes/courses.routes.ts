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


const coursesRouter = Router();

coursesRouter.get("/", getAllCourses);

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