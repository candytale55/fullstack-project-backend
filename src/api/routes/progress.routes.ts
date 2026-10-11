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


// Mounted at /api/v1/progress. Middleware is attached per route so public and
// authenticated progress operations can coexist explicitly.
const progressRouter = Router();


/* ------------------------------------- */
/* Current authenticated user progress   */
/* ------------------------------------- */

// This must precede GET "/:id"; otherwise Express would interpret "me" as an id.
progressRouter.get(
    "/me",
    isAuth,
    getMyProgress
);


// Records one finished study session for the caller. isAuth prevents a client from
// choosing another learner's identity in the request body.
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