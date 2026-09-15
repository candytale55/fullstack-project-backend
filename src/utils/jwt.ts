import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthTokenPayload extends JwtPayload {
    id: string;
}

/**
 * Retrieves the JWT secret from environment variables.
 * Throws an error if the secret is not defined.
 */ 
const getJwtSecret = (): string => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwtSecret;
};

/**
 * Creates a signed JWT for the provided user id, with an expiration of 15 days.
 */
const generateToken = (id: string): string => {
    return jwt.sign(
        { id },
        getJwtSecret(),
        { expiresIn: "15d" }
    );
};

/**
 * Verifies a JWT and returns its decoded payload.
 */
const verifyToken = (token: string): AuthTokenPayload => {
    const decoded = jwt.verify(
        token,
        getJwtSecret()
    );

    if (
        typeof decoded === "string" ||
        typeof decoded.id !== "string"
    ) {
        throw new Error("Invalid token payload");
    }

    return decoded as AuthTokenPayload;
};

export {
    generateToken,
    verifyToken
};