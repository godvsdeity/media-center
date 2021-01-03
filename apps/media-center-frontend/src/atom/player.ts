import { atom, selector } from "recoil";

import { AvailablePlayer, DlnaPlayer, PlayerTorrentData } from "../interface";

export const dlnaPlayersState = atom<DlnaPlayer[]>({
  key: "dlnaPlayersState",
  default: [],
});

export const availablePlayersQuery = selector<AvailablePlayer[]>({
  key: "availablePlayersQuery",
  get: ({ get }) => {
    const players: AvailablePlayer[] = [
      { type: "browser", ref: "__browser__", name: "Browser" },
    ];
    get(dlnaPlayersState).forEach((player) =>
      players.push({
        type: "dlna",
        ref: player.name,
        name: player.name,
      })
    );
    return players;
  },
});

export const selectedPlayerRefState = atom({
  key: "selectedPlayerRefState",
  default: "__browser__",
});

export const selectedPlayerQuery = selector<AvailablePlayer>({
  key: "selectedPlayerQuery",
  get: ({ get }) => {
    const selectedPlayerRef = get(selectedPlayerRefState);
    const availablePlayers = get(availablePlayersQuery);
    return (
      availablePlayers.find((player) => player.ref === selectedPlayerRef) ||
      availablePlayers[0]
    );
  },
});

export const playerModalState = atom({
  key: "playerModelState",
  default: false,
});

export const playerTorrentDataState = atom<PlayerTorrentData>({
  key: "playerTorrentDataState",
  default: {},
});
