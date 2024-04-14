import { config as conf } from "dotenv";

conf();

const _config = {
  port: process.env.PORT,
  mongodbURI: process.env.MONGO_CONNECTION_URI,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,

  // cloudinary secrets
  cloudinary_cloud: process.env.CLOUDINARY_CLOUD,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};

export const config = Object.freeze(_config);
