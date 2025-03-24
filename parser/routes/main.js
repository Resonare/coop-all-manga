import express from "express";

import mainController from "../controllers/main.js";

const router = express.Router();

router.get("/parse", mainController.parse);
router.get("/get-all", mainController.getAll);
router.get("/get-title", mainController.getTitle);

export default router;
