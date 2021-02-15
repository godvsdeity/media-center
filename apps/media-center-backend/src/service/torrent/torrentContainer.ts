import WebTorrent from "webtorrent";
import os from "os";
import fs from "fs";
import path from "path";
import ParseTorrent from "parse-torrent";
import MagnetUri from "magnet-uri";

const defaultTorrentsDownloadDir = process.env.MEDIA_CENTER_DATA_DIR
  ? path.join(process.env.MEDIA_CENTER_DATA_DIR, "torrents")
  : path.join(os.tmpdir(), "media-center-data", "torrents");

export class TorrentContainer {
  constructor(
    protected torrentClient: WebTorrent.Instance,
    protected torrentsDownloadDir: string = defaultTorrentsDownloadDir,
    protected torrentsUrlCacheDir: string = "cache"
  ) {
    const torrentsCacheFolder = path.join(
      torrentsDownloadDir,
      torrentsUrlCacheDir
    );
    if (!fs.existsSync(torrentsCacheFolder)) {
      fs.mkdirSync(torrentsCacheFolder, { recursive: true });
    }

    const magnetUriPaths = fs.readdirSync(torrentsCacheFolder, {
      encoding: "utf8",
    });
    magnetUriPaths.forEach((magnetUriPath) => {
      const magnetUriData = fs.readFileSync(
        path.join(torrentsCacheFolder, magnetUriPath),
        { encoding: "utf8" }
      );
      try {
        this.addTorrent(ParseTorrent(magnetUriData));
      } catch (error) {
        // silent
      }
    });

    torrentClient.on("error", (e) => console.log(e));
  }

  public addTorrent(magnetUri: MagnetUri.Instance): WebTorrent.Torrent {
    if (!magnetUri.infoHash) {
      throw new Error("Invalid torrent url");
    }

    const data = ParseTorrent.toMagnetURI(magnetUri);

    const torrent = this.torrentClient.add(data, {
      path: path.join(this.torrentsDownloadDir, magnetUri.infoHash),
    });
    torrent.once("ready", () => {
      torrent.deselect(0, torrent.pieces.length - 1, 0);

      fs.writeFileSync(
        path.join(
          this.torrentsDownloadDir,
          this.torrentsUrlCacheDir,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          magnetUri.infoHash!
        ),
        data,
        { encoding: "utf8" }
      );
    });

    return torrent;
  }

  getTorrents(): WebTorrent.Torrent[] {
    return this.torrentClient.torrents;
  }

  getTorrent(torrentId: string): WebTorrent.Torrent | void {
    return this.torrentClient.get(torrentId);
  }

  getTorrentClient(): WebTorrent.Instance {
    return this.torrentClient;
  }
}
