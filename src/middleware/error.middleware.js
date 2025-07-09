import { ResponseError } from "../utils/error.js";
import logger from "../config/logger.js";

const errorMiddleware = (error, req, res, next) => {
  if (!error) {
    next();
  }

  if (error instanceof ResponseError) {
    logger.error(error);
    const responsePayload = {
      message: error.message,
    };

    if (Object.keys(error.errors).length > 0) {
      responsePayload.errors = error.errors;
    }

    res.status(error.statusCode).json(responsePayload).end();
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
