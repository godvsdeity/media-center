import "../patch/webtorrent";
import WebTorrent from "webtorrent";

import { TorrentContainer } from "../service";

const torrentClient = new WebTorrent({
  maxConns: Number(process.env.TORRENT_MAX_CONNS) || 30,
});
export const torrentContainer = new TorrentContainer(torrentClient);
