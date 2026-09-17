import { Router } from "express";

import {
    getAllProgress,
    getProgress,
    getUserCourseProgress,
    createProgress,
    completeExercise,
    resetProgress,
    deleteProgress
} from "../controllers/progress.controller";


const progressRouter = Router();

progressRouter.get(
    "/",
    getAllProgress
);

progressRouter.get(
    "/user/:userId/course/:courseId",
    getUserCourseProgress
);

progressRouter.get(
    "/:id",
    getProgress
);

progressRouter.post(
    "/",
    createProgress
);

progressRouter.patch(
    "/user/:userId/course/:courseId/exercises/:exerciseId/complete",
    completeExercise
);

progressRouter.patch(
    "/:id/reset",
    resetProgress
);

progressRouter.delete(
    "/:id",
    deleteProgress
);

export default progressRouter;