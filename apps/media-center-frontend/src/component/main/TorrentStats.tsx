import React from "react";
import Octicon, { ArrowDown, ArrowUp } from "@primer/octicons-react";

import { toReadable } from "../../helper";
import torrentIo from "../../service/torrentIo";

interface TorrentStatsProps {
  playerId: string | null;
}

interface StatsData {
  downloadSpeed: number;
  downloaded: number;
  uploadSpeed: number;
  uploaded: number;
  progress: number;
  size: number;
}

function TorrentStats({ playerId }: TorrentStatsProps) {
  const [stats, setStats] = React.useState<StatsData | null>(null);

  const onStats = React.useCallback(
    (data: any) => {
      setStats({
        downloadSpeed: data.downloadSpeed,
        downloaded: data.downloaded,
        uploadSpeed: data.uploadSpeed,
        uploaded: data.uploaded,
        progress: data.progress,
        size: data.size,
      });
    },
    []
  );

  React.useEffect(() => {
    if (!playerId) {
      return;
    }

    torrentIo.on(`stats-${playerId}`, onStats);
    return () => {
      torrentIo.off(`stats-${playerId}`, onStats);
    };
  }, [onStats, playerId]);

  return (
    <>
      {!!stats && (
        <section className="d-flex small">
          <div className="text-success">
            {toReadable(stats.downloadSpeed)} <Octicon icon={ArrowDown} />
          </div>
          <div className="m-auto text-info">
            {(stats.progress * 100).toFixed(2)} % (
            {toReadable(stats.downloaded)} / {toReadable(stats.size)})
          </div>
          <div className="text-danger">
            {toReadable(stats.uploadSpeed)} <Octicon icon={ArrowUp} />
          </div>
        </section>
      )}
    </>
  );
}

export default TorrentStats;
