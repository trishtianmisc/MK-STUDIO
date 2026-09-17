import { Router } from "express";
import * as contactController from "../controllers/contact.controller.js";

const router = Router();

router.post("/contact", contactController.sendInquiry);

export default router;
