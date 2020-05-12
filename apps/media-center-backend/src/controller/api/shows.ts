import Koa from "koa";

import { Controller, Get, ButterApiClient, ButterShowDTO } from "../../service";
import { ButterController } from "./butterController";

@Controller()
export class Shows extends ButterController {
  constructor(protected butterClient: ButterApiClient = new ButterApiClient()) {
    super(
      butterClient.getShows.bind(butterClient),
      butterClient.getShow.bind(butterClient)
    );
  }

  @Get("/shows")
  async shows(ctx: Koa.BaseContext): Promise<ButterShowDTO[]> {
    return await this.getCollection(ctx.query);
  }

  @Get("/shows/:id")
  async show(ctx: Koa.ParameterizedContext): Promise<ButterShowDTO | void> {
    return await this.getItem(ctx.params.id);
  }
}
