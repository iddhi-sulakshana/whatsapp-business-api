import { Server, Socket } from "socket.io";
import logger from "../config/logger";
import authenticateEmitter from "../../events/AuthenticateEmitter";

export default function authenticationSocket(io: Server): void {
    logger.info("Socket is listening on /socket/auth!!!");
    io.of("/socket/auth").on("connection", (socket: Socket): void => {
        logger.info("Socket client connected for authentication");

        socket.emit("change_online", global.isOnline || false);
        socket.emit("change_logged", global.isLogged || false);

        // Send new QR code to the client
        authenticateEmitter.on("change_qr", (qrCodeValue: string) => {
            logger.info("Emitting QR Code:", qrCodeValue);
            socket.emit("change_qr", qrCodeValue);
        });

        // Send online status to the client
        authenticateEmitter.on("change_online", () => {
            socket.emit("change_online", global.isOnline || false);
        });

        // Send Logged in status to the client
        authenticateEmitter.on("change_logged", () => {
            socket.emit("change_logged", global.isLogged || false);
        });

        socket.on("disconnect", () => {
            logger.info("Socket client Diconnected from authentication");
        });
    });
}
