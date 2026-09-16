import type {
    Request,
    Response,
    NextFunction
} from "express";

// Extend Express's Request interface to include an optional `user` property.
declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: string;
                name: string;
                email: string;
                role: string;
            };
        }
    }
}

import { verifyToken } from "../utils/jwt";
import User from "../api/models/User.model";

/**
 * Checks the Authorization header,
 * validates the JWT,
 * finds the authenticated user,
 * and attaches a safe subset of the user data to req.user.
 */
const isAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authorization = req.headers.authorization;

        if (
            !authorization ||
            !authorization.startsWith("Bearer ") // TODO: Maybe replace with a more flexible scheme like [, token] from the lesson (Backend -> 2 Api Rest  -> 4. Proteccion de Rutas).
        ) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        /*
         * "Bearer abc123" produces:
         * ["Bearer", "abc123"]
         * so index [1] contains the JWT.
         */
        const token = authorization.split(" ")[1];

        /* TypeScript cannot guarantee that [1] exists,
         * we check the token before passing it to verifyToken().
         */
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        console.log("Authorization header:", authorization); // TODO: Remove this debug log in production. 

        console.log("Token:", token); // TODO: Remove this debug log in production. 
        
        /* Validates the signature and expiration
         * and returns the decoded payload.
         */
        const { id } = verifyToken(token);

        console.log("Decoded token ID:", id); // TODO: Remove this debug log in production. 

        /*
         * A valid JWT does not guarantee that the user still exists. The user may have been deleted after the token was issued, so we verify the user against the database.
         */
        const user = await User.findById(id);

        if (!user) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        /*
         * We do NOT attach the password.
         * Mongoose `_id` is an ObjectId
         * `role ?? "user"` provides a fallback because the IUser
         * interface currently allows role to be optional.
         */
        req.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role ?? "user"
        };

        /*
         * Authentication succeeded.
         * Continue to the next middleware or controller.
         */
        next();

    } catch (error: unknown) {
        /* May throw if the token is invalid, malformed, or   expired.
         */
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

export { isAuth };