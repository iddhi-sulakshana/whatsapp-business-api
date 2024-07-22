import vars from "./api/config/vars";
import logger from "./api/config/logger";
import app from "./app/app";
import server from "./api/config/server";
import mongoose from "./api/config/database";

// initialize the mongodb connection
mongoose();

// start the whatsapp application
app.init();

// start the API server
server.init();
