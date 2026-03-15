import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middlewares/authenticate";

// Stub placeholder - replace with Prisma calls
const users: Array<{ id: string; username: string; email: string; password: string }> = [];

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), username, email, password: hashed };
    users.push(user);
    res.status(201).json({ success: true, data: { id: user.id, username, email } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    res.json({ success: true, data: { accessToken: token, user: { id: user.id, email: user.email, username: user.username } } });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = users.find((u) => u.id === req.user?.id);
    if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
    res.json({ success: true, data: { id: user.id, email: user.email, username: user.username } });
  } catch (err) { next(err); }
}

export async function logout(_req: Request, res: Response) {
  res.json({ success: true, message: "Logged out successfully" });
}
