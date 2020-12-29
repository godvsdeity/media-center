import { atom } from "recoil";

export interface DlnaPlayer {
  host: string;
  name: string;
}

export const dlnaPlayersState = atom<DlnaPlayer[]>({
  key: "dlnaPlayersState",
  default: [],
});
