import mongoose from "mongoose";

import { config } from "./config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("connected to mongoDb successfully ");
    });

    mongoose.connection.on("error", (err) => {
      console.log("error in connection to mongoDb", err);
    });

    const connection = await mongoose.connect(config.mongodbURI as string);
  } catch (error) {
    console.log("mongoDb connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
