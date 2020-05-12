import Koa from "koa";

import { streamTorrentsRepository } from "../../repository";
import { Controller, Get } from "../../service";

@Controller("/stream")
export class Torrents {
  @Get("/")
  listTorrents(): any {
    const torrents: any[] = [];
    for (const [key, torrent] of streamTorrentsRepository.entries()) {
      torrents.push({
        name: torrent.name,
        pathUri: key,
      });
    }
    return torrents;
  }

  @Get("/:infoHash")
  listTorrentFiles(ctx: Koa.ParameterizedContext): any {
    const torrent = streamTorrentsRepository.get(ctx.params.infoHash);
    if (!torrent) {
      // 404 - koa default response
      return;
    }

    return torrent.files.map((file) => ({
      name: file.name,
      size: file.size,
      pathUri: `${ctx.params.infoHash}/${file.id}`,
    }));
  }
}
