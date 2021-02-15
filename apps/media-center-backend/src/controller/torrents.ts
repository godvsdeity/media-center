import Koa from "koa";
import rangeParser from "range-parser";
import ParseTorrent from "parse-torrent";
import MagnetUri = require("magnet-uri");

import { Controller, Get } from "../service";
import { torrentContainer } from "../singleton";

@Controller("/torrents")
export class Torrents {
  @Get("/add")
  addTorrent(ctx: Koa.ParameterizedContext): any {
    let magnetUri: MagnetUri.Instance;
    try {
      magnetUri = ParseTorrent(ctx.query.torrent);
    } catch (error) {
      ctx.status = 400;
      ctx.body = `Invalid torrent URL.`;
      return;
    }

    const torrent = torrentContainer.addTorrent(magnetUri);
    torrent.once("noPeers", (announceType) => {
      // TODO: emit error :?
    });
    torrent.once("error", (error) => {
      // TODO: emit error
      console.error(error);
    });

    return "added";
  }

  @Get("/")
  listTorrents(): any {
    return [...torrentContainer.getTorrents()].reverse().map((torrent) => ({
      infoHash: torrent.infoHash,
      name: torrent.name,
      ready: torrent.ready,
      done: torrent.done,
      paused: torrent.paused,
    }));
  }

  @Get("/:infoHash")
  listTorrentFiles(ctx: Koa.ParameterizedContext): any {
    const torrent = torrentContainer.getTorrent(ctx.params.infoHash);
    if (!torrent) {
      // 404 - koa default response
      return;
    }

    return torrent.files.map((file, index) => ({
      index,
      name: file.name,
      size: file.length,
    }));
  }

  @Get("/:infoHash/:fileId/stream")
  async downloadTorrentFile(ctx: Koa.ParameterizedContext): Promise<void> {
    const { infoHash, fileId } = ctx.params;
    const torrent = torrentContainer.getTorrent(infoHash);
    if (!torrent) {
      ctx.status = 404;
      ctx.body = `No torrent with id "${infoHash}"`;
      return;
    }
    if (!torrent.ready) {
      ctx.status = 400;
      ctx.body = "The torrent is not yet ready.";
    }
    const file = torrent.files[parseInt(fileId)];
    if (!file) {
      ctx.status = 404;
      ctx.body = `No file with id "${fileId}"`;
      return;
    }
    const fileName = file.name;

    // set streaming headers
    ctx.attachment(fileName, { fallback: false, type: "inline" });
    ctx.set("Accept-Ranges", "bytes");
    ctx.set("transferMode.dlna.org", "Streaming");
    ctx.set(
      "contentFeatures.dlna.org",
      "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000"
    );

    const ranges = rangeParser(file.length, ctx.headers.range || "");
    if (ranges === -1) {
      ctx.status = 416; // unsatisfiable range request
      ctx.set("Content-Range", `bytes */${file.length}`);
      return;
    }

    let range: rangeParser.Range | undefined;
    if (Array.isArray(ranges)) {
      ctx.status = 206; // indicates that range-request was understood

      // no support for multi-range request, just use the first range
      range = ranges[0];

      ctx.set(
        "Content-Range",
        `bytes ${range.start}-${range.end}/${file.length}`
      );
      ctx.set("Content-Length", (range.end - range.start + 1).toString());
    } else {
      ctx.set("Content-Length", file.length.toString());
    }

    ctx.body = file.createReadStream(range);
  }
}
