import type {
    Request,
    Response,
    NextFunction
} from "express";

/**
 * Checks whether the authenticated user has the admin role.
 * This middleware must run AFTER isAuth,
 * because isAuth is responsible for adding req.user.
 */
const isAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    
    
    // If there is no auth user, or they are not an admin,
    // access to the protected resource is denied.
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Forbidden",
            error: "You do not have the required role to access this resource."
        });
    }

    // User is authenticated and has the admin role.
    // Continue to the next middleware or controller.
    next();
};

export { isAdmin };