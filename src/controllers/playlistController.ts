import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authenticate";

// Stub placeholder
type Playlist = { id: string; name: string; description?: string; isPublic: boolean; userId: string; songs: string[] };
const playlists: Playlist[] = [];

export async function getAllPlaylists(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const user = playlists.filter((p) => p.userId === req.user!.id);
    const paginated = user.slice((page - 1) * limit, page * limit);
    res.json({ success: true, data: paginated, total: user.length, page, limit });
  } catch (err) { next(err); }
}

export async function getPlaylistById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const p = playlists.find((p) => p.id === req.params.id);
    if (!p) { res.status(404).json({ success: false, message: "Playlist not found" }); return; }
    res.json({ success: true, data: p });
  } catch (err) { next(err); }
}

export async function createPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const p: Playlist = { id: Date.now().toString(), ...req.body, userId: req.user!.id, songs: [] };
    playlists.push(p);
    res.status(201).json({ success: true, data: p });
  } catch (err) { next(err); }
}

export async function updatePlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idx = playlists.findIndex((p) => p.id === req.params.id);
    if (idx === -1) { res.status(404).json({ success: false, message: "Playlist not found" }); return; }
    playlists[idx] = { ...playlists[idx], ...req.body };
    res.json({ success: true, data: playlists[idx] });
  } catch (err) { next(err); }
}

export async function deletePlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idx = playlists.findIndex((p) => p.id === req.params.id);
    if (idx === -1) { res.status(404).json({ success: false, message: "Playlist not found" }); return; }
    playlists.splice(idx, 1);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function addSongToPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const p = playlists.find((p) => p.id === req.params.id);
    if (!p) { res.status(404).json({ success: false, message: "Playlist not found" }); return; }
    const { songId } = req.body;
    if (!p.songs.includes(songId)) p.songs.push(songId);
    res.json({ success: true, data: p });
  } catch (err) { next(err); }
}

export async function removeSongFromPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const p = playlists.find((p) => p.id === req.params.id);
    if (!p) { res.status(404).json({ success: false, message: "Playlist not found" }); return; }
    p.songs = p.songs.filter((id) => id !== req.params.songId);
    res.json({ success: true, data: p });
  } catch (err) { next(err); }
}
