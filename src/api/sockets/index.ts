import { Express } from "express";
import { Server } from "socket.io";
import http from "http";
import authenticationSocket from "./authenticate";

export default (app: Express): http.Server => {
    const server: http.Server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            // allowedHeaders: ["token"], //   use of   :   const user = socket.handshake.headers.user;
        },
    });

    // mount socket paths here
    authenticationSocket(io);

    return server;
};
