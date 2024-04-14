import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";

cloudinary.config({
  cloud_name: config.cloudinary_cloud,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_key,
});

export default cloudinary;

cloudinary.config({
  cloud_name: "ddlyhfxjz",
  api_key: "183123974945664",
  api_secret: "47tM316SiB0ktex_0S-mXESwVWw",
});
