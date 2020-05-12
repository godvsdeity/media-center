import React from "react";
import { useParams } from "react-router-dom";

import placeholder from "./poster-placeholder.png";
import { API_HOST } from "../../constants";
import PlayerNavBar from "./PlayerNavBar";
import Spinner from "./Spinner";

interface ShowProps {
  apiResource: string;
  getPosterUrl?: Function;
}

function Show({ apiResource, getPosterUrl }: ShowProps) {
  const { id } = useParams();
  const [item, setItem] = React.useState<any>(null);
  const [activeSeason, setActiveSeason] = React.useState<number>(1);
  const [activeEpisode, setActiveEpisode] = React.useState<number>(1);

  const onSeasonBtnClick = React.useCallback((season: number) => {
    setActiveSeason(season);
    setActiveEpisode(1);
  }, []);

  const onEpisodeBtnClick = React.useCallback((episode: number) => {
    setActiveEpisode(episode);
  }, []);

  React.useEffect(() => {
    (async () => {
      const response = await fetch(`${API_HOST}${apiResource}/${id}`);
      const item = await response.json();
      setItem(item);
    })();
  }, [id, apiResource]);

  const seasons: JSX.Element[] = [];
  const episodes: JSX.Element[] = [];
  if (item) {
    for (let index = 1; index <= item.num_seasons; index++) {
      const classes = `list-group-item list-group-item-action bg-dark text-light btn-sm${
        index === activeSeason ? " active" : ""
      }`;
      seasons.push(
        <button
          key={index}
          type="button"
          className={classes}
          data-season={index}
          onClick={() => onSeasonBtnClick(index)}
        >
          Season {index}
        </button>
      );
    }

    item.episodes
      .filter((episode) => parseInt(episode.season) === activeSeason)
      .sort((eA, eB) => eA.episode - eB.episode)
      .forEach((episode) => {
        const classes = `list-group-item list-group-item-action bg-dark text-light btn-sm${
          parseInt(episode.episode) === activeEpisode ? " active" : ""
        }`;
        episodes.push(
          <button
            key={episode.episode}
            type="button"
            className={classes}
            data-episode={episode.episode}
            onClick={() => onEpisodeBtnClick(parseInt(episode.episode))}
          >
            {episode.episode}. {episode.title}
          </button>
        );
      });
  }
  const activeEpisodeData = item
    ? item.episodes.find(
        (episode) =>
          parseInt(episode.season) === activeSeason &&
          parseInt(episode.episode) === activeEpisode
      )
    : null;

  return item ? (
    <article className="movie-article">
      <section className="row">
        <section className="col col-auto" title="show poster">
          <img
            className="img-fluid"
            src={
              getPosterUrl
                ? getPosterUrl(item)
                : item.images.poster || placeholder
            }
            alt={item.title}
            width="134"
          />
        </section>
        <section className="col" title="show details">
          <h3 className="mt-0">{item.title}</h3>
          <span className="small">
            {item.year} &middot; {item.runtime} min &middot;{" "}
            {item.genres.join(" / ")}
          </span>
          <p className="lead mt-3 mb-5 small">{item.synopsis}</p>
        </section>
      </section>

      <section className="row mt-3">
        <section
          className="col col-auto"
          title="show seasons"
          style={{ height: "500px", overflow: "scroll" }}
        >
          <div className="list-group">{seasons}</div>
        </section>
        <section
          className="col col-auto"
          title="show episodes"
          style={{ height: "500px", overflow: "scroll" }}
        >
          <div className="list-group">{episodes}</div>
        </section>
        <section
          className="col position-relative"
          title="show episode"
          style={{ height: "inherit" }}
        >
          {activeEpisodeData && (
            <>
              <h5 className="mt-0">{activeEpisodeData.title}</h5>
              <span className="small">
                Season {activeEpisodeData.season} Episode{" "}
                {activeEpisodeData.episode}
              </span>
              <p className="mt-3 mb-5">{activeEpisodeData.overview}</p>

              <PlayerNavBar
                itemId={activeEpisodeData.tvdb_id}
                season={activeSeason}
                episode={activeEpisode}
                imdbId={item.imdb_id}
                title={activeEpisodeData.title}
                torrents={{ en: activeEpisodeData.torrents }}
              />
            </>
          )}
        </section>
      </section>
    </article>
  ) : (
    <article>
      <Spinner />
    </article>
  );
}

export default Show;
