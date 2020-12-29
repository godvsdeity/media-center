import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSetRecoilState } from "recoil";

import "./App.css";
import { dlnaPlayersState } from "./atom";
import { NavBar, Movies, Movie, Shows, Show } from "./component";
import playerIo from "./service/playerIo";

function App() {
  const setDlnaPlayers = useSetRecoilState(dlnaPlayersState);
  const onDlnaPlayers = React.useCallback(
    (dlnaPlayers) => {
      console.log("dlna-players", dlnaPlayers);
      setDlnaPlayers(dlnaPlayers);
    },
    [setDlnaPlayers]
  );
  const onNewDlnaPlayer = React.useCallback(
    (dlnaPlayer) => {
      console.log("new-dlna-player", dlnaPlayer);
      setDlnaPlayers((dlnaPlayers) => {
        if (
          dlnaPlayers.find(
            (_dlnaPlayer) => _dlnaPlayer.name === dlnaPlayer.name
          )
        ) {
          return dlnaPlayers;
        }

        return [...dlnaPlayers, dlnaPlayer];
      });
    },
    [setDlnaPlayers]
  );

  React.useEffect(() => {
    playerIo.once("dlna-players", onDlnaPlayers);
    playerIo.on("new-dlna-player", onNewDlnaPlayer);

    return () => {
      playerIo.off("new-dlna-player", onNewDlnaPlayer);
    };
  });

  return (
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

          <Route path="/">
            <Redirect to="/movies" />
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;
