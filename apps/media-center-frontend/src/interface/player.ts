export interface DlnaPlayer {
  host: string;
  name: string;
}
export interface AvailablePlayer {
  type: "browser" | "dlna";
  ref: string;
  name: string;
}

export type AvailablePlayers = AvailablePlayer[];
export interface StreamData {
  infoHash: string;
  fileName: string;
  fileType: string;
  streamUrl: string;
  subUrl: string;
}

export interface PlayerTorrentData {
  itemId?: string;
  imdbId?: string;
  season?: number;
  episode?: number;
  torrentUrl?: string;
  infoHash?: string;
}
