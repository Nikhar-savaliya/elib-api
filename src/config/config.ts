import { config as conf } from "dotenv";

conf();

const _config = {
  port: process.env.PORT,
  mongodbURI: process.env.MONGO_CONNECTION_URI,
  env: process.env.NODE_ENV,
};

export const config = Object.freeze(_config);
