import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import vars from "./vars";

const app = express();

app.use(morgan(vars.logs));

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mount api routes

export default app;
