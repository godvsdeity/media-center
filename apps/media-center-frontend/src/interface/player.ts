export interface AvailablePlayer {
  type: "browser" | "dlna";
  ref: string;
  name: string;
}

export type AvailablePlayers = AvailablePlayer[];
