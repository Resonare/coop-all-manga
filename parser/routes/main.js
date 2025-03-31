import express from "express";

import mainController from "../controllers/main.js";

const router = express.Router();

router.get("/parse", mainController.parse);
router.get("/titles", mainController.getAll);
router.get("/titles/:titleId", mainController.getTitle);

export default router;
