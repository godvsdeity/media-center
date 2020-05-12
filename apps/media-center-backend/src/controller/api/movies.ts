import Koa from "koa";

import {
  Controller,
  Get,
  ButterApiClient,
  ButterMovieDTO,
} from "../../service";
import { ButterController } from "./butterController";

@Controller("/movies")
export class Movies extends ButterController {
  constructor(protected butterClient: ButterApiClient = new ButterApiClient()) {
    super(
      butterClient.getMovies.bind(butterClient),
      butterClient.getMovie.bind(butterClient)
    );
  }

  @Get("/")
  async movies(ctx: Koa.BaseContext): Promise<ButterMovieDTO[]> {
    return await this.getCollection(ctx.query);
  }

  @Get("/:id")
  async movie(ctx: Koa.ParameterizedContext): Promise<ButterMovieDTO | void> {
    return await this.getItem(ctx.params.id);
  }
}
