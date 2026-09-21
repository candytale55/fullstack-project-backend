/*
 * Maps progress URLs to progress.controller
 * operations for user activity tracking.
 */

import { Router } from "express";

import { isAuth }
    from "../../middlewares/isAuth";

import {
    getAllProgress,
    getProgress,
    getUserCourseProgress,
    createProgress,
    completeExercise,
    resetProgress,
    deleteProgress,
    getMyProgress,
    saveStudySession
} from "../controllers/progress.controller";


const progressRouter = Router();


/* ------------------------------------- */
/* Current authenticated user progress   */
/* ------------------------------------- */

// Debe ir siempre antes de GET + "/:id" 
// para evitar que la ruta "/me" sea interpretada como un ":id"
progressRouter.get(
    "/me",
    isAuth,
    getMyProgress
);


progressRouter.patch(
    "/me/course/:courseId/session",
    isAuth,
    saveStudySession
);


/* ------------------------------------- */
/* Existing progress routes              */
/* ------------------------------------- */

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