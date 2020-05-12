import "reflect-metadata";
import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import http from "http";
import socketio from "socket.io";

import {
  registerControllers,
  playerOnConnection,
  broadcastTorrentStats,
} from "../service";
import { Torrents, DownloadTorrentFile, Subtitles } from "../controller/stream";
import { Movies, Animes, Shows } from "../controller/api";

function bootstrapSocketio(server: http.Server): void {
  const io = socketio(server);
  io.of("/player").on("connection", playerOnConnection);
  broadcastTorrentStats(io.of("/torrent"));
}

function bootstrapKoaApp(app: Koa): void {
  const router = new Router();

  registerControllers(router, [
    Torrents,
    DownloadTorrentFile,
    Subtitles,
    Movies,
    Animes,
    Shows,
  ]);

  app
    .use(
      cors({
        maxAge: 600,
      })
    )
    .use(router.routes())
    .use(router.allowedMethods());
}

function bootstrap(): void {
  const app = new Koa();
  const server = http.createServer(app.callback());

  bootstrapSocketio(server);
  bootstrapKoaApp(app);

  const port = process.env.STREAM_API_SERVER_PORT || 4000;
  server.listen(port, () => {
    console.log(`Streaming API is listening on ${port}`);
  });
}

bootstrap();
