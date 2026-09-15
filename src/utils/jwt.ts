import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthTokenPayload extends JwtPayload {
    id: string;
}


const getJwtSecret = (): string => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwtSecret;
};

/**
 * Creates a signed JWT for the provided user id.
 */
const generateToken = (id: string): string => {
    return jwt.sign(
        { id },
        getJwtSecret(),
        { expiresIn: "30d" }
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