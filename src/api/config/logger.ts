import winston from "winston";

const logger: any = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        new winston.transports.File({ filename: "logs/combined.log" }), // log all levels
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}

logger.stream = () => {
    return {
        write: (message: string) => {
            logger.info(message.trim());
        },
    };
};

export default logger;
