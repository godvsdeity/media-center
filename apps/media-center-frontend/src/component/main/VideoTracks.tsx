import React from "react";

interface VideoTracksProps {
  subUrl: string;
  defaultLang: string;
}

interface SubtitleTrack {
  id: string;
  lang: string;
  langcode: string;
  vtt: string;
}

const VideoTracks = ({ subUrl, defaultLang }: VideoTracksProps) => {
  const [tracks, setTracks] = React.useState<SubtitleTrack[]>([]);

  React.useEffect(() => {
    (async () => {
      const response = await fetch(subUrl);
      const tracks: Record<string, SubtitleTrack> = await response.json();
      setTracks([...Object.values(tracks)]);
    })();
  }, [subUrl]);

  return tracks.length ? (
    <>
      {tracks.map((track) => (
        <track
          key={track.id}
          label={track.lang}
          kind="subtitles"
          srcLang={track.langcode}
          src={`${subUrl}&lang=${track.langcode}`}
          default={track.langcode === defaultLang}
        />
      ))}
    </>
  ) : null;
};

export default VideoTracks;
