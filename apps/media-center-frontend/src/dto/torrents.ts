export interface TorrentDTO {
  readonly infoHash: string;
  readonly name: string;
  readonly ready: boolean;
  readonly done: boolean;
  readonly paused: boolean;
}

export interface StatsDataDTO {
  downloadSpeed: number;
  downloaded: number;
  uploadSpeed: number;
  uploaded: number;
  progress: number;
  size: number;
}

export interface StreamDataDTO {
  playerId: string;
  infoHash: string;
  fileName: string;
  fileType: string;
  streamUri: string;
}
