import { ResponseError } from "../utils/response.error.js";
import logger from "../config/logger.js";

const errorMiddleware = (error, req, res, next) => {
  if (!error) {
    next();
  }

  if (error instanceof ResponseError) {
    logger.error(error);
    res
      .status(error.statusCode)
      .json({
        message: error.message,
        errors: error.errors,
      })
      .end();
  } else if (error instanceof Error) {
    logger.error(error);
    console.log(error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Internal Server Error",
      })
      .end();
  } else {
    next();
  }
};

export { errorMiddleware };
