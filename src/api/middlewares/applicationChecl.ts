// middleware to check if the application is running
import { Request, Response, NextFunction } from "express";

export const healthCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!global.isOnline) {
        res.status(500).json({ message: "Service is offline" });
        return;
    }
    if (!global.isLogged) {
        res.status(500).json({ message: "Service is not authenticated" });
        return;
    }
    next();
};
