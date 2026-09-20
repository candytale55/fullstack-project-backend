/* Maps vocabulary URLs to vocabulary.controller operations for course content. */

import { Router } from "express";

import {
    getAllVocabulary,
    getVocabularyByCourse,
    getVocabularyByUnit,
    getVocabularyItem,
    createVocabularyItem,
    updateVocabularyItem,
    deleteVocabularyItem
} from "../controllers/vocabulary.controller";


const vocabularyRouter = Router();

vocabularyRouter.get(
    "/",
    getAllVocabulary
);

vocabularyRouter.get(
    "/course/:courseId/unit/:unitId",
    getVocabularyByUnit
);

vocabularyRouter.get(
    "/course/:courseId",
    getVocabularyByCourse
);

vocabularyRouter.get(
    "/:id",
    getVocabularyItem
);

vocabularyRouter.post(
    "/",
    createVocabularyItem
);

vocabularyRouter.patch(
    "/:id",
    updateVocabularyItem
);

vocabularyRouter.delete(
    "/:id",
    deleteVocabularyItem
);

export default vocabularyRouter;