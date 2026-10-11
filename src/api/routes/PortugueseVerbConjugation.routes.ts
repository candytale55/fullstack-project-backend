/* Exposes conjugation queries consumed by the frontend Portuguese exercise service. */

import { Router } from "express";

import {
    getPortugueseVerbConjugations
} from '../controllers/PortugueseVerbConjugation';


// Mounted at /api/v1/portuguese-verb-conjugations. Filters are query parameters,
// keeping this endpoint a read-only collection query.
const router = Router();

router.get(
    "/",
    getPortugueseVerbConjugations
);


export default router;