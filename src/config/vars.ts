import path from "path";
import dotenv from "dotenv-safe";

dotenv.config({
    path: path.join(__dirname, "../../.env"),
    example: path.join(__dirname, "../../.env.example"),
});

export default {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    mongo: {
        uri: process.env.MONGO_URI ? process.env.MONGO_URI : "",
    },
    logs: process.env.NODE_ENV === "production" ? "combined" : "dev",
};
