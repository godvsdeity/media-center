import React from "react";
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from "recoil";

import {
  availablePlayersQuery,
  selectedPlayerRefState,
  torrentsQuery,
} from "../../atom";
import { TorrentsRow } from "./TorrentsRow";

function Torrents() {
  const torrentsLoadable = useRecoilValueLoadable(torrentsQuery);
  const availablePlayers = useRecoilValue(availablePlayersQuery);
  const [selectedPlayerRef, setSelectedPlayerRef] = useRecoilState(
    selectedPlayerRefState
  );

  const onPlayerChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedPlayerRef(event.currentTarget.value);
    },
    [setSelectedPlayerRef]
  );

  const torrents =
    torrentsLoadable.state === "hasValue" ? torrentsLoadable.contents : [];

  return (
    <>
      {availablePlayers.length && (
        <div className="float-right mb-3">
          <span>Playing on: </span>
          <select
            id="players"
            className="custom-select custom-select-sm"
            onChange={onPlayerChange}
            defaultValue={selectedPlayerRef}
            title="Players"
            style={{ width: 200 }}
          >
            {availablePlayers.map((player) => (
              <option key={player.ref} value={player.ref}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <table className="table table-dark table-sm table-striped align-middle">
        <thead>
          <tr>
            <th scope="col">Torrent Name</th>
            <th scope="col" className="text-center">
              Actions
            </th>
            <th scope="col">Progress</th>
            <th scope="col" className="text-right">
              DL Speed
            </th>
            <th scope="col" className="text-right">
              UL Speed
            </th>
          </tr>
        </thead>
        <tbody>
          {torrents.map((torrent) => (
            <TorrentsRow key={torrent.infoHash} torrent={torrent} />
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Torrents;
