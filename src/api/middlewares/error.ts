import { NextFunction, Response, Request } from "express";
import winston from "winston";

// create an error handling middleware function
export default function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // log the error message and error object
    winston.error(err.message, err);
    // set the HTTP response status to 500 and send the error message
    res.status(500).send({
        errors: [
            {
                status: "Internal Server Error",
                title: err.message,
                detail: err.message,
            },
        ],
    });
}
