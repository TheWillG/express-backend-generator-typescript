import app from "./src/app";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import { logger, port, mongoUrl, isProduction } from "./lib/config";

mongoose.connect(mongoUrl);

app.use(helmet());
isProduction ? app.use(morgan("combined")) : app.use(morgan("dev"));

app.listen(port);
logger.info(`App listening on port ${port}!`);
