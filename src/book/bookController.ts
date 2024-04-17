import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.files);
  const { title, genre } = req.body;

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const coverImageFileName = files.coverImage[0].filename;
    const coverImageFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      coverImageFileName
    );

    const coverImageUploadResult = await cloudinary.uploader.upload(
      coverImageFilePath,
      {
        filename_override: coverImageFileName,
        folder: "book-covers",
        format: coverImageMimeType,
      }
    );

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

    const _req = req as AuthRequest;

    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: coverImageUploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    // delete files from public/data/uploads
    try {
      await fs.promises.unlink(coverImageFilePath);
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      console.log(error);
      return next(
        createHttpError(500, "error unlinking files from public/data/uploads")
      );
    }

    return res.json({ id: newBook._id });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "error in saving the book in database"));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  // check access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "Unauthorized Request"));
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  let updatedCoverImageUrl = "";
  if (files.coverImage) {
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const coverImageFileName = files.coverImage[0].filename;
    const coverImageFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      coverImageFileName
    );

    const coverImageUploadResult = await cloudinary.uploader.upload(
      coverImageFilePath,
      {
        filename_override: coverImageFileName,
        folder: "book-covers",
        format: coverImageMimeType,
      }
    );
    updatedCoverImageUrl = coverImageUploadResult.secure_url;
    try {
      await fs.promises.unlink(coverImageFilePath);
    } catch (error) {
      console.log(error);
      return next(
        createHttpError(
          500,
          "error unlinking coverimage from public/data/uploads"
        )
      );
    }
  }

  let updatedBookUrl = "";
  if (files.file) {
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
    updatedBookUrl = bookFileUploadResult.secure_url;
    try {
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      console.log(error);
      return next(
        createHttpError(500, "error unlinking pdf from public/data/uploads")
      );
    }
  }

  const updatedBook = await bookModel.findOneAndUpdate(
    { _id: bookId },
    {
      title: title,
      genre: genre,
      coverImage: updatedCoverImageUrl ? updatedCoverImageUrl : book.coverImage,
      file: updatedBookUrl ? updatedBookUrl : book.file,
    },
    { new: true }
  );

  res.json(updatedBook);
};

const listAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO : add paggination ( mongoose paggination )
    const books = await bookModel.find();
    res.json(books);
  } catch (error) {
    return next(createHttpError(500, "error while getting all book"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;
  try {
    const book = await bookModel.findOne({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "error while getting a single book"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;
  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "book not found"));
  }

  // check access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "Unauthorized Request"));
  }

  // delete files from cloudinary

  // generate coverImage PublicId
  const coverImageSplits = book.coverImage.split("/");
  const coverImagePublicID =
    coverImageSplits.at(-2) + "/" + coverImageSplits.at(-1)?.split(".")[0];
  // console.log(coverImagePublicID);

  // generate bookImage PublicId
  const bookFileSplits = book.file.split("/");
  const bookFilePublicID = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
  // console.log(bookFilePublicID);

  try {
    await cloudinary.uploader.destroy(coverImagePublicID);
    await cloudinary.uploader.destroy(bookFilePublicID, {
      resource_type: "raw",
    });
  } catch (error) {
    return next(createHttpError(500, "cloudinary file deletion failed"));
  }

  try {
    await bookModel.deleteOne({ _id: bookId });
  } catch (error) {
    return next(createHttpError(500, "database book deletion failed"));
  }

  return res.sendStatus(204);
};

export { createBook, updateBook, listAllBooks, getSingleBook, deleteBook };
