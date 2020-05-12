import socketio from "socket.io";
import WebTorrent from "webtorrent";

import { torrentContainer } from "../../singleton";

function getFile(torrent: WebTorrent.Torrent, fileId?: number): any[] {
  if (fileId !== undefined) {
    return [fileId, torrent.files[fileId]];
  }

  let responseFile: WebTorrent.TorrentFile | null = null;
  let responseFileId: number | null = null;
  torrent.files.forEach((file, index) => {
    if (responseFile === null || responseFile.length < file.length) {
      responseFile = file;
      responseFileId = index;
    }
  });

  return [responseFileId, responseFile];
}

function sendStatsUpdates(
  socketNsp: socketio.Namespace,
  torrent: WebTorrent.Torrent
): void {
  const response = getFile(torrent);
  const file = response[1] as WebTorrent.TorrentFile | null;
  // TODO find a way to clear the interval when the torrent is deleted
  setInterval(() => {
    socketNsp.emit(`stats-${torrent.infoHash}`, {
      uploadSpeed: torrent.uploadSpeed,
      uploaded: torrent.uploaded,
      downloadSpeed: torrent.downloadSpeed,
      downloaded: (file && file.downloaded) || torrent.downloaded,
      progress: (file && file.progress) || torrent.progress,
      size: (file && file.length) || torrent.length,
    });
  }, 1000);
}

export function broadcastTorrentStats(socketNsp: socketio.Namespace): void {
  torrentContainer.getTorrents().forEach((torrent) => {
    if (!torrent.ready) {
      torrent.once("ready", () => sendStatsUpdates(socketNsp, torrent));
      return;
    }
    sendStatsUpdates(socketNsp, torrent);
  });
  torrentContainer
    .getTorrentClient()
    .on("torrent", (torrent) => sendStatsUpdates(socketNsp, torrent));
}
