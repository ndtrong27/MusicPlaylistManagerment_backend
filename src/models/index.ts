// Prisma schema — rename to schema.prisma and place in prisma / schema.prisma
// datasource db {
//     provider = "postgresql"
//     url = env("DATABASE_URL")
// }

// generator client {
//     provider = "prisma-client-js"
// }

/**
 * This file documents the data models.
 * When integrating Prisma, create prisma/schema.prisma with:
 */
//   model User {
//     id        String @id @default (cuid())
//     username  String @unique
//     email     String @unique
//     password  String
//     playlists Playlist[]
//     createdAt DateTime @default (now())
// }

//   model Song {
//     id        String @id @default (cuid())
//     title     String
//     artist    String
//     album     String ?
//         duration  Int
//     coverUrl  String ?
//         audioUrl  String ?
//             genre     String ?
//                 playlists PlaylistSong[]
//     createdAt DateTime @default (now())
// }

//   model Playlist {
//     id          String @id @default (cuid())
//     name        String
//     description String ?
//         coverUrl    String ?
//             isPublic    Boolean @default (false)
//     userId      String
//     user        User @relation(fields: [userId], references: [id])
//     songs       PlaylistSong[]
//     createdAt   DateTime @default (now())
//     updatedAt   DateTime @updatedAt
// }

//   model PlaylistSong {
//     playlistId String
//     songId     String
//     order      Int @default (0)
//     playlist   Playlist @relation(fields: [playlistId], references: [id])
//     song       Song @relation(fields: [songId], references: [id])
//     @@id([playlistId, songId])
// }

export { };
