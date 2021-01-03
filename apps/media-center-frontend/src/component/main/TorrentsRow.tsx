import React from "react";
import Octicon, { ArrowDown, ArrowUp, Play } from "@primer/octicons-react";

import { StatsDataDTO, TorrentDTO } from "../../dto";
import { toReadable } from "../../helper";
import torrentIo from "../../service/torrentIo";
import { useSetRecoilState } from "recoil";
import { playerModalState, playerTorrentDataState } from "../../atom";

interface TorrentsRowProps {
  readonly torrent: TorrentDTO;
}

export function TorrentsRow({ torrent }: TorrentsRowProps) {
  const { infoHash } = torrent;

  const setShowPlayer = useSetRecoilState(playerModalState);
  const setPlayerTorrentData = useSetRecoilState(playerTorrentDataState);

  const [stats, setStats] = React.useState<StatsDataDTO>({
    downloadSpeed: 0,
    downloaded: 0,
    uploadSpeed: 0,
    uploaded: 0,
    progress: 0,
    size: 0,
  });

  const onStats = React.useCallback((data: StatsDataDTO) => {
    setStats(data);
  }, []);

  const showPlayer = () => {
    setPlayerTorrentData({
      infoHash,
      itemId: infoHash,
    });
    setShowPlayer(true);
  };

  React.useEffect(() => {
    if (!infoHash) {
      return;
    }

    torrentIo.on(`stats-${infoHash}`, onStats);
    return () => {
      torrentIo.off(`stats-${infoHash}`, onStats);
    };
  }, [onStats, infoHash]);

  return (
    <>
      <tr>
        <td className="align-middle">{torrent.name}</td>
        <td className="text-center">
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={showPlayer}
            title="Play"
          >
            <Octicon icon={Play} />
          </button>
        </td>
        <td className="text-info align-middle">
          {(stats.progress * 100).toFixed(2)} % ({toReadable(stats.downloaded)}{" "}
          / {toReadable(stats.size)})
        </td>
        <td className="text-success align-middle text-right">
          {toReadable(stats.downloadSpeed)} <Octicon icon={ArrowDown} />
        </td>
        <td className="text-danger align-middle text-right">
          {toReadable(stats.uploadSpeed)} <Octicon icon={ArrowUp} />
        </td>
      </tr>
    </>
  );
}
