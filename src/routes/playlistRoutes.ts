import { Router } from "express";
import * as playlistController from "../controllers/playlistController";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/", authenticate, playlistController.getAllPlaylists);
router.get("/:id", authenticate, playlistController.getPlaylistById);
router.post("/", authenticate, playlistController.createPlaylist);
router.put("/:id", authenticate, playlistController.updatePlaylist);
router.delete("/:id", authenticate, playlistController.deletePlaylist);

// Nested song management
router.post("/:id/songs", authenticate, playlistController.addSongToPlaylist);
router.delete("/:id/songs/:songId", authenticate, playlistController.removeSongFromPlaylist);

export default router;
