import path from "path";
import dotenv from "dotenv-safe";

dotenv.config({
    path: path.join(__dirname, "../../../.env"),
    example: path.join(__dirname, "../../../.env.example"),
});

const variables: {
    env: string;
    port: number;
    jwtSecret: string;
    mongo: {
        uri: string;
    };
    logs: string;
} = {
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || "supersecret",
    mongo: {
        uri: process.env.MONGO_URI ? process.env.MONGO_URI : "",
    },
    logs: process.env.NODE_ENV === "production" ? "tiny" : "dev",
};

export default variables;
