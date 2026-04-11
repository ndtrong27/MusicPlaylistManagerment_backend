import { Request, Response } from 'express';

// ── Spotify Refresh Token helper ─────────────────────────────────────────────
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const provider_refresh_token = req.cookies?.refresh_token;

    if (!provider_refresh_token || typeof provider_refresh_token !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'No valid refresh token found in cookies',
      });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: missing Spotify credentials',
      });
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', provider_refresh_token);

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = (await tokenRes.json()) as
      | SpotifyTokenResponse
      | { error: string; error_description: string };

    if (!tokenRes.ok) {
      console.error('[authController.refresh] Spotify error:', data);
      return res.status(tokenRes.status).json({
        success: false,
        message: 'Failed to refresh Spotify token',
        error: data,
      });
    }

    return res.json({
      success: true,
      data: data as SpotifyTokenResponse,
    });
  } catch (error: unknown) {
    console.error('[authController.refresh]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh',
    });
  }
};


export const saveRefreshToken = (req: Request, res: Response) => {
  const refreshToken = req.query.refresh_token as string | undefined;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
  }
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return res.json({
    success: true,
    message: 'Refresh token saved successfully',
  });
}
