export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl?: string;
  audioUrl?: string;
  genre?: string;
  createdAt: Date;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  userId: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
