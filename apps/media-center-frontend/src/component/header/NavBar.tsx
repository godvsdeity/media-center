import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import qs from "querystring";
import Octicon, { Search } from "@primer/octicons-react";

import LiNavLink from "./LiNavLink";
import { useQuery } from "../../hook";
import {
  defaultSort,
  sorts,
  genres,
  defaultGenre,
  defaultOrder,
} from "../../helper";

function NavBar() {
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();
  const [keywords, setKeywords] = React.useState(query.get("keywords") || "");

  const resourcePath = location.pathname.split("/")[1];
  const defaultSortValue = `${query.get("sort") || defaultSort}-${
    query.get("order") || defaultOrder
  }`;
  const defaultGenreValue = query.get("genre") || defaultGenre;

  const doSearch = (event: React.FormEvent) => {
    const params: Record<string, string> = {};
    query.forEach((value, key) => (params[key] = value));
    params.keywords = keywords;

    history.push(`/${resourcePath}?${qs.stringify(params)}`);

    event.preventDefault();
  };

  const onSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) {
      return;
    }

    const params: Record<string, string> = {};
    const [sort, order] = event.target.value.split("-");

    query.forEach((value, key) => (params[key] = value));
    params.sort = sort;
    params.order = order;

    history.push(`/${resourcePath}?${qs.stringify(params)}`);
  };

  const onGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) {
      return;
    }

    const params: Record<string, string> = {};

    query.forEach((value, key) => (params[key] = value));
    params.genre = event.target.value;

    history.push(`/${resourcePath}?${qs.stringify(params)}`);
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#topMenu"
        aria-controls="topMenu"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="topMenu">
        <ul className="navbar-nav">
          <LiNavLink to="/movies" activeClassName="active" className="nav-link">
            Movies
          </LiNavLink>
          <LiNavLink to="/shows" activeClassName="active" className="nav-link">
            Shows
          </LiNavLink>
          <LiNavLink to="/animes" activeClassName="active" className="nav-link">
            Animes
          </LiNavLink>
        </ul>
        <form className="form-inline my-2 my-lg-0 mr-auto text-info">
          <label htmlFor="sort" className="mr-2" hidden>
            Sort
          </label>
          <select
            id="sort"
            className="form-control-plaintext form-control-sm mr-sm-2 text-info"
            style={{ width: 100 }}
            onChange={onSortChange}
            value={defaultSortValue}
          >
            <option value="">Choose...</option>
            {sorts.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
          <label htmlFor="genre" className="mr-2" hidden>
            Genre
          </label>
          <select
            id="genre"
            className="form-control-plaintext form-control-sm mr-sm-2 text-info"
            style={{ width: 100 }}
            onChange={onGenreChange}
            value={defaultGenreValue}
          >
            <option value="">Choose...</option>
            {genres.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </form>
        <form className="form-inline my-2 my-lg-0" onSubmit={doSearch}>
          <input
            className="form-control form-control-sm mr-sm-2"
            type="search"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="Search"
            aria-label="Search"
          />
          <button
            className="btn btn-sm btn-outline-success my-2 my-sm-0"
            type="submit"
          >
            <Octicon icon={Search}></Octicon>
          </button>
        </form>
      </div>
    </nav>
  );
}

export default NavBar;
