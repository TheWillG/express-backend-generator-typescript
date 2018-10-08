import dotenv from "dotenv";
import log4js from "log4js";

dotenv.config();
const logger = log4js.getLogger();

logger.level = process.env.LOGGER_LEVEL || "INFO";
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/myapp";
const isProduction = process.env.NODE_ENV === "production";

export { logger, port, mongoUrl, isProduction };
