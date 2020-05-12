export enum ButterCollectionSortOrder {
  ASC = 1,
  DESC = -1,
}

export interface ButterCollectionParams {
  sort?: string;
  order?: ButterCollectionSortOrder;
  genre?: string;
  keywords?: string;
}

export interface ButterImagesDTO {
  poster: string;
  fanart: string;
  banner: string;
}

export interface ButterRatingDTO {
  percentage: number;
  watching: number;
  votes: number;
  loved: number;
  hated: number;
}

export enum ButterVideoLanguage {
  EN = "en",
}

export enum ButterVideoResolution {
  DEFAULT = "0",
  SD = "480p",
  HD = "720p",
  FHD = "1080p",
  UHD = "2160p",
}

export interface ButterVideoTorrentDTO {
  provider: string;
  filesize?: string; // human readable file size
  size?: number;
  peer: number;
  seed: number;
  url: string;
}

export interface ButterMovieDTO {
  _id: string;
  imdb_id: string;
  title: string;
  year: string;
  synopsis: string;
  runtime: string;
  released: number;
  certification: string;
  torrents: Partial<
    Record<
      ButterVideoLanguage,
      Partial<Record<ButterVideoResolution, ButterVideoTorrentDTO>>
    >
  >;
  trailer: string;
  genres: string[];
  images: ButterImagesDTO;
  rating: ButterRatingDTO;
}

export interface ButterShowSummaryDTO {
  _id: string;
  imdb_id: string;
  tvdb_id: string;
  title: string;
  year: string;
  slug: string;
  num_seasons: number;
  images: ButterImagesDTO;
  rating: ButterRatingDTO;
}

export interface ButterShowEpisodeDTO {
  torrents: Record<ButterVideoResolution, ButterVideoTorrentDTO>;
  watched: { watched: boolean };
  first_aired: number;
  date_based: boolean;
  overview: string;
  title: string;
  episode: number;
  season: number;
  tvdb_id: number;
}

export interface ButterShowDTO extends ButterShowSummaryDTO {
  synopsis: string;
  runtime: string;
  country: string;
  network: string;
  air_day: string;
  air_time: string;
  status: string;
  last_updated: number;
  genres: string[];
  episodes: ButterShowEpisodeDTO[];
}

export interface ButterAnimeSummaryDTO {
  _id: string;
  mal_id: string;
  title: string;
  year: string;
  slug: string;
  type: string;
  num_seasons: number;
  images: ButterImagesDTO;
  rating: ButterRatingDTO;
}

export interface ButterAnimeEpisodeDTO {
  torrents: Record<ButterVideoResolution, ButterVideoTorrentDTO>;
  overview: string;
  title: string;
  episode: string;
  season: string;
  tvdb_id: number;
}

export interface ButterAnimeDTO extends ButterAnimeSummaryDTO {
  synopsis: string;
  runtime: string;
  status: string;
  last_updated: number;
  genres: string[];
  episodes: ButterAnimeEpisodeDTO[];
}
