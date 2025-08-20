import { env } from "./env.js";

export const cookieOpts = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  domain: env.cookieDomain,
  path: "/",
};
