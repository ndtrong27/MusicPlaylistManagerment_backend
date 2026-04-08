import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authenticate";

// Stub placeholder
const songs: Array<{ id: string; title: string; artist: string; duration: number; userId: string }> = [];

export async function getAllSongs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const start = (page - 1) * limit;
    const paginated = songs.slice(start, start + limit);
    res.json({ success: true, data: paginated, total: songs.length, page, limit });
  } catch (err) { next(err); }
}

export async function getSongById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const song = songs.find((s) => s.id === req.params.id);
    if (!song) { res.status(404).json({ success: false, message: "Song not found" }); return; }
    res.json({ success: true, data: song });
  } catch (err) { next(err); }
}

export async function createSong(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const song = { id: Date.now().toString(), ...req.body, userId: req.user!.id };
    songs.push(song);
    res.status(201).json({ success: true, data: song });
  } catch (err) { next(err); }
}

export async function updateSong(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idx = songs.findIndex((s) => s.id === req.params.id);
    if (idx === -1) { res.status(404).json({ success: false, message: "Song not found" }); return; }
    songs[idx] = { ...songs[idx], ...req.body };
    res.json({ success: true, data: songs[idx] });
  } catch (err) { next(err); }
}

export async function deleteSong(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idx = songs.findIndex((s) => s.id === req.params.id);
    if (idx === -1) { res.status(404).json({ success: false, message: "Song not found" }); return; }
    songs.splice(idx, 1);
    res.status(204).send();
  } catch (err) { next(err); }
}
