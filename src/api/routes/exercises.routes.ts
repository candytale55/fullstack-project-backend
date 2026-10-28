/* Maps exercise URLs to exercise.controller operations used by the learning flow. */

import { Router } from "express";

import {
    getAllExercises,
    getExercisesByCourse,
    getExercisesByUnit,
    getExercise,
    createExercise,
    updateExercise,
    deleteExercise
} from "../controllers/exercise.controller";


// Mounted at /api/v1/exercises. More-specific course paths precede "/:id" to keep
// route matching deterministic.
const exercisesRouter = Router();

// A unit route must come before the broader course route because both share the
// same initial "/course/:courseId" segment.
exercisesRouter.get(
    "/",
    getAllExercises
);

exercisesRouter.get(
    "/course/:courseId/unit/:unitId",
    getExercisesByUnit
);

exercisesRouter.get(
    "/course/:courseId",
    getExercisesByCourse
);

exercisesRouter.get(
    "/:id",
    getExercise
);

exercisesRouter.post(
    "/",
    createExercise
);

exercisesRouter.patch(
    "/:id",
    updateExercise
);

exercisesRouter.delete(
    "/:id",
    deleteExercise
);

export default exercisesRouter;