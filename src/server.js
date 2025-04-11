import app from "./app.js";
import connectDB from "./config/database.js";
import logger from "./config/logger.js";

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server berjalan di http://localhost:${PORT}`);
  });
});
