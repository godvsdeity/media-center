import { isBoolean } from "util";
import { ThrottleGroup } from "stream-throttle";
import Torrent from "webtorrent/lib/torrent";
import Peer from "webtorrent/lib/peer";
import debug from "debug";
import Wire from "bittorrent-protocol";

const debugLog = debug("webtorrent:peer");
const oldSelect = Torrent.prototype.select;
Torrent.prototype.select = function (
  start: number,
  end: number,
  priority?: number,
  notify?: () => void
): void {
  const _priority = isBoolean(priority) ? 100 : priority;
  oldSelect.apply(this, [start, end, _priority, notify]);
};

// hopefully this will be in webtorrent at some point
const downloadThrottle = new ThrottleGroup({
  rate:
    process.env.TORRENT_DOWNLOAD_LIMIT !== undefined
      ? parseInt(process.env.TORRENT_DOWNLOAD_LIMIT)
      : Number.MAX_VALUE,
});
const uploadThrottle = new ThrottleGroup({
  rate:
    process.env.TORRENT_UPLOAD_LIMIT !== undefined
      ? parseInt(process.env.TORRENT_UPLOAD_LIMIT)
      : Number.MAX_VALUE,
});
const oldCreateTCPOutgoingPeer = Peer.createTCPOutgoingPeer;
Peer.createTCPOutgoingPeer = (addr, swarm): any => {
  const peer = oldCreateTCPOutgoingPeer(addr, swarm);
  peer.onConnect = function (): void {
    if (this.destroyed) return;
    this.connected = true;

    debugLog("Peer %s connected", this.id);

    clearTimeout(this.connectTimeout);

    const conn = this.conn;
    conn.once("end", () => {
      this.destroy();
    });
    conn.once("close", () => {
      this.destroy();
    });
    conn.once("finish", () => {
      this.destroy();
    });
    conn.once("error", (err) => {
      this.destroy(err);
    });

    const wire = (this.wire = new Wire() as any);
    wire.type = this.type;
    wire.once("end", () => {
      this.destroy();
    });
    wire.once("close", () => {
      this.destroy();
    });
    wire.once("finish", () => {
      this.destroy();
    });
    wire.once("error", (err) => {
      this.destroy(err);
    });

    wire.once("handshake", (infoHash, peerId) => {
      this.onHandshake(infoHash, peerId);
    });
    this.startHandshakeTimeout();

    if (this.type === "tcpOutgoing" || this.type === "webrtc") {
      conn
        .pipe(downloadThrottle.throttle())
        .pipe(wire)
        .pipe(uploadThrottle.throttle())
        .pipe(conn);
    } else {
      conn.pipe(wire).pipe(conn);
    }
    if (this.swarm && !this.sentHandshake) this.handshake();
  };

  return peer;
};
