const express = require("express");
const router = express.Router();

import { Request, Response, NextFunction } from "express";

router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.send("/testAPI: API is working properly");
});

module.exports = router;
