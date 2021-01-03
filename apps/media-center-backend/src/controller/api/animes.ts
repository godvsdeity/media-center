import Koa from "koa";

import {
  Controller,
  Get,
  ButterApiClient,
  ButterAnimeDTO,
} from "../../service";
import { ButterController } from "./butterController";

@Controller("/animes")
export class Animes extends ButterController {
  constructor(protected butterClient: ButterApiClient = new ButterApiClient()) {
    super(
      butterClient.getAnimes.bind(butterClient),
      butterClient.getAnime.bind(butterClient)
    );
  }

  @Get("/")
  async animes(ctx: Koa.BaseContext): Promise<ButterAnimeDTO[]> {
    return await this.getCollection(ctx.query);
  }

  @Get("/:id")
  async anime(ctx: Koa.ParameterizedContext): Promise<ButterAnimeDTO | void> {
    return await this.getItem(ctx.params.id);
  }
}
