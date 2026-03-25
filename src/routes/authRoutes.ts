import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/oauth2", authController.requestAccessTokenAndRefreshToken);
router.post("/refresh", authController.refresh);

export default router;
