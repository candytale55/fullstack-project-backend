/* Maps vocabulary URLs to vocabulary.controller operations for course content. */

import { Router } from "express";
import { isAuth } from "../../middlewares/isAuth";
import { isAdmin } from "../../middlewares/isAdmin";    
import {
    getAllVocabulary,
    getVocabularyItem,
    createVocabularyItem,
    updateVocabularyItem,
    deleteVocabularyItem
} from "../controllers/vocabulary.controller";


// Read endpoints are public learning content; write endpoints below require an
// authenticated administrator because they change the shared vocabulary catalog.
const vocabularyRouter = Router();

vocabularyRouter.get(
    "/",
    getAllVocabulary
);

vocabularyRouter.get(
    "/:id",
    getVocabularyItem
);

// Middleware order matters: isAdmin relies on the req.user object attached by isAuth.
vocabularyRouter.post(
    "/",
    isAuth,
    isAdmin,
    createVocabularyItem
);

vocabularyRouter.patch(
    "/:id",
    isAuth,
    isAdmin,
    updateVocabularyItem
);

vocabularyRouter.delete(
    "/:id",
    isAuth,
    isAdmin,
    deleteVocabularyItem
);

export default vocabularyRouter;