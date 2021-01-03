import React from "react";
import Octicon, { DeviceCameraVideo, Play } from "@primer/octicons-react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import TrailerModal from "./TrailerModal";
import {
  availablePlayersQuery,
  playerModalState,
  playerTorrentDataState,
  selectedPlayerRefState,
} from "../../atom";

interface PlayerNavBarProps {
  itemId: string;
  imdbId?: string;
  season?: number;
  episode?: number;
  title: string;
  trailer?: string;
  torrents: Record<string, any>;
}

function PlayerNavBar({
  itemId,
  imdbId,
  season,
  episode,
  title,
  trailer,
  torrents,
}: PlayerNavBarProps) {
  const availablePlayers = useRecoilValue(availablePlayersQuery);
  const setShowPlayer = useSetRecoilState(playerModalState);
  const setPlayerTorrentData = useSetRecoilState(playerTorrentDataState);
  const [selectedPlayerRef, setSelectedPlayerRef] = useRecoilState(
    selectedPlayerRefState
  );

  const [showTrailer, setShowTrailer] = React.useState(false);

  const audioLanguages = Object.keys(torrents);
  const defaultAudioLang = Object.keys(torrents)[0];
  const defaultResolution = Object.keys(torrents[defaultAudioLang])[0];

  const [audioLanguage, setAudioLanguage] = React.useState(defaultAudioLang);
  const [resolution, setResolution] = React.useState(defaultResolution);

  const resolutions = audioLanguage
    ? Object.keys(torrents[audioLanguage]).filter((res) => res !== "0")
    : [];

  const toggleShowTrailer = React.useCallback(
    () => setShowTrailer((showTrailer) => !showTrailer),
    []
  );
  const showPlayer = () => {
    setPlayerTorrentData({
      itemId,
      imdbId,
      season,
      episode,
      torrentUrl:
        audioLanguage && resolution
          ? torrents[audioLanguage][resolution].url
          : undefined,
    });
    setShowPlayer(true);
  };
  const onAudioLanguageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setAudioLanguage(event.currentTarget.value);
    },
    []
  );
  const onResolutionChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setResolution(event.currentTarget.value);
    },
    []
  );
  const onPlayerChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedPlayerRef(event.currentTarget.value);
    },
    [setSelectedPlayerRef]
  );

  return (
    <>
      <nav
        className="navbar navbar-expand-md navbar-dark bg-dark position-absolute"
        style={{ left: 0, bottom: 0, width: "100%", padding: "inherit" }}
      >
        <button
          className="navbar-toggler"
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
          type="button"
          data-toggle="collapse"
          data-target="#playerMenu"
          aria-controls="playerMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <Octicon icon={DeviceCameraVideo} />
        </button>

        <div className="collapse navbar-collapse" id="playerMenu">
          <form className="form-inline" style={{ width: "100%" }}>
            <div className="mr-auto">
              {trailer && (
                <button
                  type="button"
                  className="btn btn-light my-1 mr-2"
                  onClick={toggleShowTrailer}
                >
                  Watch Trailer
                </button>
              )}
            </div>
            {audioLanguages.length > 1 && (
              <>
                <label className="my-1 mr-2" htmlFor="audioLanguage" hidden>
                  Audio Language
                </label>
                <select
                  id="audioLanguage"
                  className="custom-select my-1 mr-2"
                  onChange={onAudioLanguageChange}
                  defaultValue={audioLanguage}
                >
                  {audioLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </>
            )}
            {resolutions.length > 1 && (
              <>
                <label className="my-1 mr-2" htmlFor="resolution" hidden>
                  Resolution
                </label>
                <select
                  id="resolution"
                  className="custom-select my-1 mr-2"
                  onChange={onResolutionChange}
                  defaultValue={resolution}
                  title="Resolution"
                >
                  {resolutions.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
              </>
            )}

            {availablePlayers.length > 1 && (
              <select
                id="players"
                className="custom-select my-1"
                onChange={onPlayerChange}
                defaultValue={selectedPlayerRef}
                title="Players"
                style={{ width: 100 }}
              >
                {availablePlayers.map((player) => (
                  <option key={player.ref} value={player.ref}>
                    {player.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              className="btn btn-light"
              onClick={showPlayer}
              title="Play"
            >
              <Octicon icon={Play} />
            </button>
          </form>
        </div>
      </nav>

      {!!trailer && (
        <TrailerModal
          trailer={trailer}
          title={title}
          show={showTrailer}
          onHide={toggleShowTrailer}
        />
      )}
    </>
  );
}

export default PlayerNavBar;
