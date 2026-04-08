import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/refresh", authController.refresh);
router.get("/processCallback", authController.processCallback);
router.get("/saveRefreshToken", authController.saveRefreshToken);
export default router;
