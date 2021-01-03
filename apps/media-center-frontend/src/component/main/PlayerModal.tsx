import React from "react";
import ReactDom from "react-dom";
import Modal from "react-bootstrap/Modal";
import ResponsiveEmbed from "react-bootstrap/ResponsiveEmbed";
import Octicon, { Clippy } from "@primer/octicons-react";
import * as uuid from "uuid";
import { useRecoilState, useRecoilValue } from "recoil";

import { API_HOST } from "../../constants";
import { defaultLang } from "../../helper";
import TorrentStats from "./TorrentStats";
import VideoTracks from "./VideoTracks";
import playerIo from "../../service/playerIo";
import { StreamDataDTO } from "../../dto";
import {
  playerModalState,
  playerTorrentDataState,
  selectedPlayerQuery,
} from "../../atom";
import { StreamData } from "../../interface";

const supportedFileTypes = ["video/mp4", "video/webm", "video/ogg"];

function PlayerModal() {
  const player = useRecoilValue(selectedPlayerQuery);
  const [showPlayer, setShowPlayer] = useRecoilState(playerModalState);
  const {
    itemId,
    imdbId,
    season,
    episode,
    torrentUrl,
    infoHash,
  } = useRecoilValue(playerTorrentDataState);

  const [streamData, setStreamData] = React.useState<StreamData | null>(null);
  const [showSpinner, setShowSpinner] = React.useState(true);
  const [canPlayVideo, setCanPlayVideo] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const streamUrlRef = React.useRef<HTMLInputElement | null>(null);

  const isBrowserPlayer = player.type === "browser";

  const playerId = React.useMemo(() => {
    return `${itemId}-${uuid.v4()}`;
  }, [itemId]);

  const onPlaying = React.useCallback(() => setIsPlaying(true), []);

  const onLoaded = React.useCallback(
    (data: StreamDataDTO) => {
      if (data.playerId !== playerId) {
        return;
      }

      let subUrl = `${API_HOST}${data.streamUri.replace(
        "stream",
        "sub"
      )}?imdbid=${imdbId || itemId}`;
      if (season) {
        subUrl += `&season=${season}`;
      }
      if (episode) {
        subUrl += `&episode=${episode}`;
      }
      if (player.type !== "browser") {
        subUrl += `&lang=${defaultLang}&srt=true`;
      }
      const streamData = {
        infoHash: data.infoHash,
        streamUrl: `${API_HOST}${data.streamUri}`,
        subUrl,
        fileName: data.fileName,
        fileType: data.fileType,
      };

      ReactDom.unstable_batchedUpdates(() => {
        setShowSpinner(false);
        setStreamData(streamData);
        setCanPlayVideo(supportedFileTypes.includes(data.fileType));
      });

      if (player.type !== "browser") {
        playerIo.once(`playing-${playerId}`, onPlaying);
        playerIo.emit("play", { playerId, player, streamData });
      }
    },
    [playerId, itemId, imdbId, season, episode, player, onPlaying]
  );

  React.useEffect(() => {
    if (!showPlayer || !itemId) {
      return;
    }

    playerIo.once(`loaded-${playerId}`, onLoaded);
    playerIo.emit("load", {
      playerId,
      torrentUrl,
      infoHash,
    });

    return () => {
      setStreamData(null);
      setIsPlaying(false);
      setShowSpinner(true);

      playerIo.emit("stop", { playerId, player });
    };
  }, [
    showPlayer,
    onLoaded,
    playerId,
    itemId,
    torrentUrl,
    infoHash,
    onPlaying,
    player,
  ]);

  return (
    <Modal
      size="xl"
      show={showPlayer}
      onHide={React.useCallback(() => setShowPlayer(false), [setShowPlayer])}
      animation={false}
    >
      <Modal.Body className="bg-dark">
        <TorrentStats infoHash={streamData && streamData.infoHash} />
        <ResponsiveEmbed aspectRatio="16by9">
          <>
            {showSpinner && (
              <div className="embed-responsive-item d-flex justify-content-center">
                <div className="spinner-border text-light m-auto" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
            {!showSpinner && (
              <>
                {!!streamData && !isBrowserPlayer && (
                  <div className="embed-responsive-item d-flex justify-content-center">
                    <div className="text-small m-auto">
                      {!isPlaying && (
                        <p>Loading the movie on "{player.name}"</p>
                      )}
                      {isPlaying && <p>Playing the movie on "{player.name}"</p>}
                    </div>
                  </div>
                )}
                {!!streamData && isBrowserPlayer && !canPlayVideo && (
                  <div className="embed-responsive-item d-flex justify-content-center">
                    <div className="m-auto form-inline" style={{ width: 305 }}>
                      <div className="text-small text-danger mb-2">
                        The video format("{streamData.fileType}"") is not
                        supported by your browser. Please use the following url
                        to watch the movie in a player like VLC.
                      </div>
                      <input
                        ref={streamUrlRef}
                        className="form-control form-control-sm"
                        type="text"
                        value={streamData.streamUrl}
                        readOnly
                        style={{ width: "270px" }}
                      />
                      <button
                        className="btn btn-sm btn-light"
                        title="Copy"
                        onClick={() => {
                          if (!streamUrlRef || !streamUrlRef.current) {
                            return;
                          }
                          streamUrlRef.current.select();
                          streamUrlRef.current.setSelectionRange(0, 99999);
                          document.execCommand("copy");
                        }}
                      >
                        <Octicon icon={Clippy} />
                      </button>
                    </div>
                  </div>
                )}
                {!!streamData && isBrowserPlayer && canPlayVideo && (
                  <video
                    className="embed-responsive-item"
                    controls
                    autoPlay
                    playsInline
                    crossOrigin="use-credential"
                  >
                    <source
                      src={streamData.streamUrl}
                      type={streamData.fileType}
                    />
                    <VideoTracks
                      subUrl={streamData.subUrl}
                      defaultLang={defaultLang}
                    />
                  </video>
                )}
              </>
            )}
          </>
        </ResponsiveEmbed>
      </Modal.Body>
    </Modal>
  );
}

export default PlayerModal;
