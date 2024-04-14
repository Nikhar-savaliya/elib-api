import express from "express";

import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

// routes
app.get("/", (req, res, next) => {
  return res.json({ message: "hello world" });
});

// global error handler
app.use(globalErrorHandler);

export default app;
