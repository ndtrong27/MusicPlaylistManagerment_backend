import { Router } from "express";
import * as songController from "../controllers/songController";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/", authenticate, songController.getAllSongs);
router.get("/:id", authenticate, songController.getSongById);
router.post("/", authenticate, songController.createSong);
router.put("/:id", authenticate, songController.updateSong);
router.delete("/:id", authenticate, songController.deleteSong);

export default router;
