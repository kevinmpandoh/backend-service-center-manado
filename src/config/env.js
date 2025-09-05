import "dotenv/config";

export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpires: process.env.ACCESS_EXPIRES || "15m",
  refreshExpires: process.env.REFRESH_EXPIRES || "30d",
  cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};
