import { selector, atom } from "recoil";

import { API_HOST } from "../constants";
import { TorrentDTO } from "../dto";

export const torrentsRequestIdState = atom({
  key: "torrentsRequestIdState",
  default: 0,
});

export const torrentsQuery = selector<TorrentDTO[]>({
  key: "torrentsQuery",
  get: async ({ get }) => {
    get(torrentsRequestIdState);
    const response = await fetch(`${API_HOST}torrents`);
    return await response.json();
  },
});
