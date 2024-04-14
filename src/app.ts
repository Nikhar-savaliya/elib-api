import express from "express";

const app = express();

// routes
app.get("/", (req, res) => {
  return res.json({ message: "hello world" });
});

export default app;
