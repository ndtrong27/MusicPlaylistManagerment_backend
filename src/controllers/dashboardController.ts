import { Request, Response } from 'express';

// ── Spotify response shape helpers ───────────────────────────────────────────
interface SpotifyImage { url: string }
interface SpotifyArtist { name: string }
interface SpotifyAlbum { images: SpotifyImage[] }
interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
}
interface SpotifyRecentItem { track: SpotifyTrack }
interface SpotifyProfile {
  id: string;
  display_name?: string;
  email?: string;
  images?: SpotifyImage[];
}
interface SpotifyPlaylist {
  id: string;
  name: string;
  images: SpotifyImage[];
}
interface SpotifyPaginated { total?: number }
interface SpotifyPaginatedPlaylists extends SpotifyPaginated {
  items: SpotifyPlaylist[];
}
interface SpotifyRecentlyPlayed { items?: SpotifyRecentItem[] }

// ── Controller ───────────────────────────────────────────────────────────────
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.query;

    if (!access_token || typeof access_token !== 'string') {
      return res.status(400).json({ success: false, message: 'access_token is required' });
    }

    const headers = { Authorization: `Bearer ${access_token}` };

    // ── Parallel Spotify API calls ──────────────────────────────────────
    const [profileRes, playlistsRes, tracksRes, recentRes] = await Promise.all([
      fetch('https://api.spotify.com/v1/me', { headers }),
      fetch('https://api.spotify.com/v1/me/playlists?limit=50', { headers }),
      fetch('https://api.spotify.com/v1/me/tracks?limit=1', { headers }),
      fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', { headers }),
    ]);

    if (!profileRes.ok) {
      return res.status(profileRes.status).json({
        success: false,
        message: 'Failed to fetch Spotify profile. Token may be expired.',
      });
    }

    const profile = (await profileRes.json()) as SpotifyProfile;
    const playlists = (await playlistsRes.json()) as SpotifyPaginatedPlaylists;
    const tracks = (await tracksRes.json()) as SpotifyPaginated;
    const recent = (await recentRes.json()) as SpotifyRecentlyPlayed;

    // ── Map recently played tracks ──────────────────────────────────────
    const recentDiscoveries = (recent?.items ?? []).map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((a) => a.name).join(', '),
      albumArt: item.track.album.images?.[0]?.url ?? '',
    }));

    return res.json({
      success: true,
      data: {
        user: {
          username: profile.display_name ?? profile.id,
          email: profile.email ?? '',
          image: profile.images?.[0]?.url ?? '',
        },
        stats: {
          playlistsCount: playlists?.total ?? 0,
          songsCount: tracks?.total ?? 0,
          playlists: (playlists?.items ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            image: p.images?.[0]?.url ?? '',
          })),
        },
        recentDiscoveries,
      },
    });
  } catch (error: unknown) {
    console.error('[getDashboardData]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
