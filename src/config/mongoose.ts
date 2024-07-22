import mongoose from "mongoose";
import logger from "./logger";
import vars from "./vars";

mongoose.connection.on("error", (err: any) => {
    logger.error(`MongoDB connection error: ${err}`);
    process.exit(-1);
});

if (vars.env === "development") {
    mongoose.set("debug", true);
}

export default () => {
    if (vars.mongo.uri) {
        mongoose
            .connect(vars.mongo.uri)
            .then(() => logger.info("MongoDB connected..."));
    }
};
