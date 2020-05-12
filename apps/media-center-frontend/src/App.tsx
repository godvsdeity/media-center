import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import "./App.css";
import { NavBar, Movies, Movie, Shows, Show, Animes } from "./component";
import {
  GlobalContext,
  initialGlobalState,
  globalStateReducer,
} from "./context/GlobalContext";
import { getAnimePosterUrl } from "./helper";
import playerIo from "./service/playerIo";

function App() {
  const [state, dispatch] = React.useReducer(
    globalStateReducer,
    initialGlobalState
  );
  const onDlnaPlayers = React.useCallback((dlnaPlayers) => {
    dispatch({ type: "dlna-players", payload: { players: dlnaPlayers } });
  }, []);
  const onNewDlnaPlayer = React.useCallback((dlnaPlayer) => {
    dispatch({ type: "new-dlna-player", payload: { player: dlnaPlayer } });
  }, []);

  React.useEffect(() => {
    playerIo.once("dlna-players", onDlnaPlayers);
    playerIo.on("new-dlna-player", onNewDlnaPlayer);

    return () => {
      playerIo.off("new-dlna-player", onNewDlnaPlayer);
    };
  });

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      <div className="container-fluid">
        <NavBar />

        <main>
          <Switch>
            <Route path="/movies/:id">
              <Movie />
            </Route>
            <Route path="/movies">
              <Movies />
            </Route>

            <Route path="/shows/:id">
              <Show apiResource="shows" />
            </Route>
            <Route path="/shows">
              <Shows />
            </Route>

            <Route path="/animes/:id">
              <Show apiResource="animes" getPosterUrl={getAnimePosterUrl} />
            </Route>
            <Route path="/animes">
              <Animes />
            </Route>

            <Route path="/">
              <Redirect to="/movies" />
            </Route>
          </Switch>
        </main>
      </div>
    </GlobalContext.Provider>
  );
}

export default App;
