import dotenv from "dotenv";

import "./config/sentryConnection";
import logger from "./config/loggingConfig";
import { connectDB } from "./config/dbConnection";
import app from "./utils/app";
import { env } from "./utils/env";

dotenv.config();

const startServer = async () => {
  logger.info("Initiating server setup...");
  try {
    // Establish connection to MongoDB
    await connectDB();

    // Start the server
    await new Promise<void>((resolve) => {
      // Start listening on the specified port
      app.listen(env.PORT, () => {
        logger.info(`Server is running on port ${env.PORT}`);
        resolve();
      });
    });

    logger.info("Server setup initiated.");
  } catch (error: any) {
    logger.error('Server failed to initialize:', { 
      message: error.message,
      config: error.config,
      stack: error.stack
    });
  }
};

// Start the server setup process
startServer();

export default app;