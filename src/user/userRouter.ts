import express from "express";

import { createUser } from "./userControllers";

const userRouter = express.Router();

// routes
userRouter.post("/register", createUser);

export default userRouter;
