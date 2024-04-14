import { config as conf } from "dotenv";

conf();

const _config = {
  port: process.env.PORT,
  mongodbURI: process.env.MONGO_CONNECTION_URI,
};

export const config = Object.freeze(_config);
