import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import { AuthRequest } from "../middlewares/authenticate";

// Stub placeholder - replace with Prisma calls
const users: Array<{ id: string; username: string; email: string; password: string }> = [];


export async function requestAccessTokenAndRefreshToken(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    console.log("OAuth2 Code received:", code);

    if (!code) {
      res.status(400).json({ success: false, message: "No code provided" });
      return;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID || "";
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "";

    const params = new URLSearchParams();
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("grant_type", "authorization_code");

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authHeader}`,
      },
      body: params.toString(),
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error("Spotify token error:", data);
      res.status(response.status).json({ success: false, message: "Failed to exchange token", error: data });
      return;
    }

    if (data.refresh_token) {
      res.cookie("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    // Fetch user profile from Spotify
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${data.access_token}`,
      },
    });

    const userData: any = await userResponse.json();
    const user = {
      id: userData.id,
      username: userData.display_name,
      email: userData.email,
    };

    const sessionToken = jwt.sign(
      { spotifyAccessToken: data.access_token, user },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      data: {
        access_token: sessionToken,
        expires_in: data.expires_in,
        user
      }
    });
  } catch (err) {
    console.error("Error in oauth2:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const refresh_token = req.cookies?.refresh_token;
    if (!refresh_token) {
      res.status(401).json({ success: false, message: "No refresh token provided in cookies" });
      return;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID || "";
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refresh_token);

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authHeader}`,
      },
      body: params.toString(),
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error("Spotify refresh error:", data);
      res.status(response.status).json({ success: false, message: "Failed to refresh token", error: data });
      return;
    }

    if (data.refresh_token) {
      res.cookie("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    // Fetch user profile from Spotify
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${data.access_token}`,
      },
    });

    const userData: any = await userResponse.json();
    const user = {
      id: userData.id,
      username: userData.display_name,
      email: userData.email,
    };

    const sessionToken = jwt.sign(
      { spotifyAccessToken: data.access_token, user },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      data: {
        access_token: sessionToken,
        expires_in: data.expires_in,
        user
      }
    });
  } catch (err) {
    console.error("Error in refresh:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
