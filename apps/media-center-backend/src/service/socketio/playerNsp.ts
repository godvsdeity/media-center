import socketio from "socket.io";
import ParseTorrent from "parse-torrent";
import WebTorrent from "webtorrent";
import mime from "mime";

import { torrentContainer, dlnaList, findDlnaPlayer } from "../../singleton";

type ActivePlayers = Map<string, boolean>;

interface PlayEvent {
  playerId: string;
  player: Record<string, string>;
  streamData: Record<string, string>;
}

function getFile(
  torrent: WebTorrent.Torrent,
  fileId?: number
): [number | null, WebTorrent.TorrentFile | null] {
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

function sendVideoData(
  socket: socketio.Socket,
  playerId: string,
  torrent: WebTorrent.Torrent
): void {
  const [fileId, file] = getFile(torrent);
  if (fileId === null || file === null) {
    // TODO: emit error
    return;
  }

  socket.emit(`loaded-${playerId}`, {
    playerId,
    infoHash: torrent.infoHash,
    fileId: fileId,
    streamUri: `torrents/${torrent.infoHash}/${fileId}/stream`,
    fileName: file.name,
    fileType: mime.getType(file.name) || "application/octet-stream",
  });
}

function onLoad(socket: socketio.Socket, activePlayers: ActivePlayers) {
  return (data: Record<string, any>): void => {
    const { playerId, torrentUrl, infoHash } = data;

    try {
      let torrent: WebTorrent.Torrent | void;
      if (infoHash) {
        torrent = torrentContainer.getTorrent(infoHash);
        if (!torrent) {
          // TODO: emit error
          return;
        }
      } else {
        const magnetUri = ParseTorrent(torrentUrl);
        if (!magnetUri.infoHash) {
          // TODO: emit error
          return;
        }

        torrent = torrentContainer.getTorrent(magnetUri.infoHash);
        if (!torrent) {
          torrent = torrentContainer.addTorrent(magnetUri);
          torrent.once("noPeers", (announceType) => {
            // TODO: emit error :?
          });
          torrent.once("error", (error) => {
            // TODO: emit error
            console.error(error);
          });
        }
      }

      activePlayers.set(playerId, true);
      if (!torrent.ready) {
        torrent.once("ready", () => {
          if (!activePlayers.has(playerId)) {
            return;
          }

          sendVideoData(socket, playerId, torrent as WebTorrent.Torrent);
        });
        return;
      }

      sendVideoData(socket, playerId, torrent);
    } catch (error) {
      console.error(error);
      // TODO: emit error
    }
  };
}

function onStop(activePlayers: ActivePlayers) {
  return async (data: Record<string, any>): Promise<void> => {
    if (activePlayers.has(data.playerId)) {
      activePlayers.delete(data.playerId);
    }

    const dlnaPlayer = findDlnaPlayer(data.player.ref);
    if (dlnaPlayer && dlnaPlayer.client) {
      await new Promise<void>((resolve, reject) =>
        dlnaPlayer.client.stop((err) => {
          if (err) return reject();
          resolve();
        })
      );
    }
  };
}

function onDisconnect(
  activePlayers: ActivePlayers,
  onDlnaListUpdateHandler: Function
) {
  return (): void => {
    activePlayers.clear();
    dlnaList.off("update", onDlnaListUpdateHandler);
  };
}

function onDlnaListUpdate(socket: socketio.Socket) {
  return (dlnaPlayer: Record<string, any>): void => {
    if (socket.disconnected) {
      return;
    }

    socket.emit("new-dlna-player", {
      host: dlnaPlayer.host,
      name: dlnaPlayer.name,
    });
  };
}

function onPlay(socket: socketio.Socket) {
  return async (data: PlayEvent): Promise<void> => {
    const player = findDlnaPlayer(data.player.ref);
    if (!player) {
      // TODO emit error
      return;
    }

    const playerOptions = {
      title: data.streamData.fileName,
      type: data.streamData.fileType,
      subtitles: [data.streamData.subUrl],
      autoSubtitles: true,
    };

    player.play(data.streamData.streamUrl, playerOptions, (error, status) => {
      if (error) {
        console.log(error);
        // TODO emit error
        return;
      }
      socket.emit(`playing-${data.playerId}`, { player: data.player, status });
    });
  };
}

export function playerOnConnection(socket: socketio.Socket): void {
  const activePlayers: ActivePlayers = new Map();

  socket.emit(
    "dlna-players",
    dlnaList.players.map((dlnaPlayer: Record<string, any>) => ({
      host: dlnaPlayer.host,
      name: dlnaPlayer.name,
    }))
  );
  const onDlnaListUpdateHandler = onDlnaListUpdate(socket);
  dlnaList.on("update", onDlnaListUpdateHandler);

  socket.on("play", onPlay(socket));
  socket.on("load", onLoad(socket, activePlayers));
  socket.on("stop", onStop(activePlayers));
  socket.on("disconnect", onDisconnect(activePlayers, onDlnaListUpdateHandler));
}
