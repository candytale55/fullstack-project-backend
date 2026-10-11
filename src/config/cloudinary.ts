import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Seed scripts import this module directly, so it loads environment variables rather
// than depending on the API entry point having run first.
dotenv.config();

export const connectCloudinary = () => {
    // Read configuration at connection time to keep this module import side-effect
    // free apart from dotenv and to fail before any upload is attempted.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Missing Cloudinary credentials in .env");
    }

    // `secure: true` makes returned delivery URLs use HTTPS. The configured client
    // is returned so callers can use uploader methods without a second import.
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true, // URLs will be HTTPS
    });

    return cloudinary;
};

