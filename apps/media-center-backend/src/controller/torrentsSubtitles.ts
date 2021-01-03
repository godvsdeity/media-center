import Koa from "koa";
import OS from "opensubtitles-api";
import axios from "axios";
import srt2vtt from "srt-to-vtt";
import memoize from "memoizee";

import { Controller, Get } from "../service";
import { torrentContainer } from "../singleton";

@Controller("/torrents")
export class Subtitles {
  protected openSubtitles: OS;
  protected openSubtitlesSearch: Function;

  constructor() {
    this.openSubtitles = new OS({
      useragent: "Popcorn Time NodeJS",
    });

    this.openSubtitlesSearch = memoize(
      this.openSubtitles.search.bind(this.openSubtitles),
      {
        maxAge: 24 * 3600 * 1000,
        promise: true,
        primitive: true,
        normalizer: JSON.stringify,
      }
    );
  }

  @Get("/:infoHash/:fileId/sub")
  async listSubtitles(ctx: Koa.ParameterizedContext): Promise<void> {
    const { infoHash, fileId } = ctx.params;
    const { lang, imdbid, season, episode, srt } = ctx.query;
    const torrent = torrentContainer.getTorrent(infoHash);
    if (!torrent || !torrent.files[fileId]) {
      ctx.status = 404;
      ctx.body = `No torrent with id "${infoHash}"`;
      return;
    }

    const file = torrent.files[fileId];
    const subtitles = await this.openSubtitlesSearch({
      extensions: ["srt", "vtt"],
      filesize: file.length,
      filename: file.name,
      imdbid,
      season,
      episode,
    });
    if (lang && subtitles[lang]) {
      const subtitleResponse = await axios(subtitles[lang].utf8, {
        responseType: "stream",
      });
      if (!subtitleResponse) {
        return;
      }

      ctx.set("Cache-Control", "max-age=600");

      if (srt) {
        ctx.set("Content-Type", "text/srt; charset=utf-8");
        ctx.body = subtitleResponse.data;
      } else {
        ctx.set("Content-Type", "text/vtt; charset=utf-8");
        ctx.body = subtitleResponse.data.pipe(srt2vtt());
      }

      return;
    } else if (lang) {
      return;
    }

    ctx.body = subtitles;
  }
}
