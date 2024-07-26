import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import vars from "./vars";
import error from "../middlewares/error";
import logger from "./logger";
import serverDetails from "../utils/serverDetails";
import routes from "../routes";
import bodyParser from "body-parser";
import { Server } from "http";
import sockets from "../sockets";

const app = express();

app.use(morgan(vars.logs));

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(error);

// mount api route path
routes(app);

// gets server from the socket
const server: Server = sockets(app);

export default {
    init: (): void => {
        const port: number = vars.port;
        server.listen(port, () => {
            logger.info(`API Server is started!!!`);
            serverDetails();
        });
    },
};
