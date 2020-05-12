import React from "react";

export interface DlnaPlayer {
  host: string;
  name: string;
}

export interface GlobalState {
  dlnaPlayers: Map<string, DlnaPlayer>;
}

export interface GlobalStateDispatchAction<T = Record<string, any>> {
  type: string;
  payload: T;
}

export const initialGlobalState: GlobalState = {
  dlnaPlayers: new Map(),
};

export function globalStateReducer(
  state: GlobalState,
  action: GlobalStateDispatchAction
) {
  switch (action.type) {
    case "dlna-players":
      state.dlnaPlayers.clear();
      action.payload.players.forEach((player: DlnaPlayer) =>
        state.dlnaPlayers.set(player.host, player)
      );
      return { ...state };

    case "new-dlna-player":
      if (state.dlnaPlayers.has(action.payload.player.name)) {
        return state;
      }
      state.dlnaPlayers.set(action.payload.player.host, action.payload.player);
      return { ...state };

    default:
      return state;
  }
}

export const GlobalContext = React.createContext<{
  state: GlobalState;
  dispatch: Function;
}>({
  state: initialGlobalState,
  dispatch: () => {},
});
