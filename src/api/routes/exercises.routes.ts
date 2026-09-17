// TODO: PROVISIONAL - Revisar antes de cargar los datos.

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


const exercisesRouter = Router();

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