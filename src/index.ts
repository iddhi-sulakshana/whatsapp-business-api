import vars from "./config/vars";
import logger from "./config/logger";
import app from "./config/express";
import mongoose from "./config/mongoose";

mongoose();
app.listen(vars.port, () => logger.info(`Server started on port ${vars.port}`));
