import logger from "../config/logger";
import vars from "../config/vars";
import os from "os";

export default (): void => {
    const starter = "http://";
    // get the ip addresses assigned to computer
    logger.info(">>>>>>>>>>>> API Server Details >>>>>>>>>>>>");
    logger.info("Server is running on: ");
    logger.info(starter + "127.0.0.1:" + vars.port);
    const networkInterfaces = os.networkInterfaces();
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        const interfaces = networkInterfaces[interfaceName];

        if (!interfaces) return;

        interfaces.forEach((interfaceInfo) => {
            if (interfaceInfo.family === "IPv4" && !interfaceInfo.internal) {
                logger.info(starter + interfaceInfo.address + ":" + vars.port);
            }
        });
    });
    logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
};
