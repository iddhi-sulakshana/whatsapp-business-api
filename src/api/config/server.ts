import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import vars from "./vars";
import error from "../middlewares/error";
import { env } from "bun";
import logger from "./logger";
import serverDetails from "../utils/serverDetails";

const server = express();

server.use(morgan(vars.logs));

server.use(cors());
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(error);

// mount api route paths

export default {
    init: (): void => {
        const port: number = vars.port;
        server.listen(port, () => {
            logger.info(`API Server is started!!!`);
            serverDetails();
        });
    },
};
