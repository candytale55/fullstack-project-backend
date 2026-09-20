/* Maps public and session endpoints to auth.controller and isAuth. */

import { Router } from "express";

import {
    register,
    login,
    getCurrentUser
} from "../controllers/auth.controller";

import { isAuth } from "../../middlewares/isAuth";


const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", isAuth, getCurrentUser);

export default authRouter;