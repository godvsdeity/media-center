import React from "react";
import { useParams } from "react-router-dom";

import placeholder from "./poster-placeholder.png";
import { API_HOST } from "../../constants";
import PlayerNavBar from "./PlayerNavBar";
import Spinner from "./Spinner";

function Movie() {
  const { id } = useParams();
  const [item, setItem] = React.useState<any>(undefined);

  React.useEffect(() => {
    (async () => {
      const response = await fetch(`${API_HOST}movies/${id}`);
      const item = await response.json();
      setItem(item);
    })();
  }, [id]);

  return item ? (
    <article className="movie-article">
      <section className="row position-relative" title="Movie details">
        <section className="col-sm col-md-4 col-lg-4">
          <img
            className="img-fluid"
            src={item.images.poster || placeholder}
            alt={item.title}
          />
        </section>
        <section className="col-sm col-md-8 col-lg-8">
          <h3 className="mt-0">{item.title}</h3>
          <span className="small">
            {item.year} &middot; {item.runtime} min &middot;{" "}
            {item.genres.join(" / ")}
          </span>
          <p className="lead mt-3 mb-5">{item.synopsis}</p>

          <PlayerNavBar
            itemId={item._id}
            trailer={item.trailer}
            title={item.title}
            torrents={item.torrents}
          />
        </section>
      </section>
    </article>
  ) : (
    <article>
      <Spinner />
    </article>
  );
}

export default Movie;
