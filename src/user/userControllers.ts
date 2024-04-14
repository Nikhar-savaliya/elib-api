import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  // database call
  const user = await userModel.findOne({ email });
  if (user) {
    const error = createHttpError(400, "user already exists with this email.");
    return next(error);
  }

  // process
  // response
};

export { createUser };
