import { Router } from "express";

import {
    getPortugueseVerbConjugations
} from '../controllers/PortugueseVerbConjugation';


const router = Router();

router.get(
    "/",
    getPortugueseVerbConjugations
);


export default router;