import React from "react";

import Items from "./Items";
import { getAnimePosterUrl } from "../../helper";

function Animes() {
  return <Items apiResource="animes" getPosterUrl={getAnimePosterUrl} />;
}

export default Animes;
