import React from "react";
import Octicon, { ArrowDown, ArrowUp } from "@primer/octicons-react";

import { toReadable } from "../../helper";
import torrentIo from "../../service/torrentIo";
import { StatsDataDTO } from "../../dto";

interface TorrentStatsProps {
  infoHash: string | null;
}

function TorrentStats({ infoHash }: TorrentStatsProps) {
  const [stats, setStats] = React.useState<StatsDataDTO | null>(null);

  const onStats = React.useCallback((data: any) => {
    setStats({
      downloadSpeed: data.downloadSpeed,
      downloaded: data.downloaded,
      uploadSpeed: data.uploadSpeed,
      uploaded: data.uploaded,
      progress: data.progress,
      size: data.size,
    });
  }, []);

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
