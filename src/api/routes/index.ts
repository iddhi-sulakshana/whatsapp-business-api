import { Express } from "express";
import baseRoute from "./base";
import order from "./order";

export default (server: Express): void => {
    server.use("/", baseRoute);
    // all whatsapp routes needs to be mounted on /api/whatsapp/*
    server.use("/api/whatsapp/order", order);
};
