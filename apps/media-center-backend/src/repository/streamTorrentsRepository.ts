export interface StreamTorrentData {
  infoHash: string;
  name: string;
  path: string;
  files: {
    id: number;
    path: string;
    name: string;
    size: number;
  }[];
}

export type StreamTorrentsRepository = Map<string, StreamTorrentData>;

export const streamTorrentsRepository: StreamTorrentsRepository = new Map();
