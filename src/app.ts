import express from "express";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();

// routes
app.get("/", (req, res, next) => {
  return res.json({ message: "hello world" });
});

app.use("/api/users", userRouter);

// global error handler
app.use(globalErrorHandler);

export default app;
