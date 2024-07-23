import { Express } from "express";
import baseRoute from "./base";

export default (server: Express): void => {
    server.use("/", baseRoute);
    // all whatsapp routes needs to be mounted on /api/whatsapp/*
};
