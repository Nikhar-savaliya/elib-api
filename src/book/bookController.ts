import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.files);
  const { title, genre } = req.body;
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFilename = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFilename
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFilename,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    const newBook = await bookModel.create({
      title,
      genre,
      author: "661b72a1ff65d9c67f7618dc",
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    // delete files from public/data/uploads
    try {
      await fs.promises.unlink(filePath);
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      console.log(error);
      return next(
        createHttpError(500, "error unlinking files from public/data/uploads")
      );
    }

    return res.json({ bookFileUploadResult, uploadResult });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "error in saving the book in database"));
  }
};

export { createBook };
