/* Maps public and session endpoints to auth.controller and isAuth. */

import { Router } from "express";

import {
    register,
    login,
    getCurrentUser
} from "../controllers/auth.controller";

import { isAuth } from "../../middlewares/isAuth";


// This router is mounted at /api/v1/auth in index.ts.
const authRouter = Router();

// Registration and login establish an identity, so they must remain public.
authRouter.post("/register", register);
authRouter.post("/login", login);
// isAuth runs before the controller and adds the safe authenticated user to req.user.
authRouter.get("/me", isAuth, getCurrentUser);

export default authRouter;