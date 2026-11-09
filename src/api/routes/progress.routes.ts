/*
 * Maps progress URLs to progress.controller
 * operations for user activity tracking.
 */

import { Router } from "express";

import { isAuth }
    from "../../middlewares/isAuth";
import { isAdmin }
    from "../../middlewares/isAdmin";

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
    isAuth,
    isAdmin,
    getAllProgress
);


progressRouter.get(
    "/user/:userId/course/:courseId",
    isAuth,
    isAdmin,
    getUserCourseProgress
);


progressRouter.get(
    "/:id",
    isAuth,
    isAdmin,
    getProgress
);


progressRouter.post(
    "/",
    isAuth,
    isAdmin,
    createProgress
);


progressRouter.patch(
    "/user/:userId/course/:courseId/exercises/:exerciseId/complete",
    isAuth,
    isAdmin,
    completeExercise
);


progressRouter.patch(
    "/:id/reset",
    isAuth,
    isAdmin,
    resetProgress
);


progressRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    deleteProgress
);


export default progressRouter;