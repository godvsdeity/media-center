import axios, { Method, AxiosRequestConfig } from "axios";
import {
  ButterCollectionParams,
  ButterMovieDTO,
  ButterShowSummaryDTO,
  ButterShowDTO,
  ButterAnimeDTO,
  ButterAnimeSummaryDTO,
} from "./types";

export class ButterApiClient {
  protected apiURLs: string[] = [];
  constructor(
    apiURLs: string[] = [
      "https://tv-v2.api-fetch.sh/",
      "https://tv-v2.api-fetch.am/",
      "https://tv-v2.api-fetch.website/",
    ]
  ) {
    apiURLs.forEach((apiURL) => {
      this.apiURLs.push(apiURL);
      this.apiURLs.push(`cf+${apiURL}`);
    });
  }

  protected buildRequest(
    options: AxiosRequestConfig,
    apiURL: string
  ): AxiosRequestConfig {
    const match = apiURL.match(/^cf\+(.*):\/\/(.*)\//);
    if (match) {
      options.baseURL = `${match[1]}://cloudflare.com/`;
      options.headers = {
        Host: match[2],
      };
    } else {
      options.baseURL = apiURL;
    }

    return options;
  }

  async get<T>(url: string, params = {}): Promise<T> {
    const method: Method = "GET";
    let options: AxiosRequestConfig = {
      url,
      method,
      params,
    };

    for (const apiURL of this.apiURLs) {
      try {
        options = this.buildRequest(options, apiURL);
        const response = await axios(options);
        return response.data;
      } catch (error) {
        if (!error.response) {
          continue;
        }
        throw error;
      }
    }

    throw new Error("No API urls provided.");
  }

  async getCollection<T>(
    resource: string,
    page = 1,
    params: ButterCollectionParams = {}
  ): Promise<T[]> {
    return await this.get(`${resource}/${page}`, params);
  }

  async getItem<T>(resource: string, id: string): Promise<T> {
    return await this.get(`${resource}/${id}`);
  }

  async getMovies(
    page = 1,
    params: ButterCollectionParams = {}
  ): Promise<ButterMovieDTO[]> {
    return await this.getCollection("movies", page, params);
  }

  async getMovie(id: string): Promise<ButterMovieDTO> {
    return await this.getItem("movie", id);
  }

  async getShows(
    page = 1,
    params: ButterCollectionParams = {}
  ): Promise<ButterShowSummaryDTO[]> {
    return await this.getCollection("shows", page, params);
  }

  async getShow(id: string): Promise<ButterShowDTO> {
    return await this.getItem("show", id);
  }

  async getAnimes(
    page = 1,
    params: ButterCollectionParams = {}
  ): Promise<ButterAnimeSummaryDTO[]> {
    return await this.getCollection("animes", page, params);
  }

  async getAnime(id: string): Promise<ButterAnimeDTO> {
    return await this.getItem("anime", id);
  }
}
