import Koa from "koa";
import Router from "@koa/router";

import { CONTROLLER_PREFIX_METADATA } from "../../service";
import { CONTROLLER_ROUTES_METADATA } from "./constants";
import { RouteInterface } from "./decorator";

export interface ClassConstructor {
  new (...args: any[]): any;
}

export function registerControllers(
  router: Router,
  controllers: ClassConstructor[]
): void {
  controllers.forEach((controller: ClassConstructor): void => {
    if (!Reflect.hasMetadata(CONTROLLER_PREFIX_METADATA, controller)) {
      return;
    }
    const prefix = Reflect.getMetadata(CONTROLLER_PREFIX_METADATA, controller);
    const routes: RouteInterface[] = Reflect.getMetadata(
      CONTROLLER_ROUTES_METADATA,
      controller
    );
    const instance = new controller();

    routes.forEach((route) => {
      router[route.httpMethod.toLowerCase()](
        prefix + route.path,
        async (
          ctx: Koa.ParameterizedContext,
          next: Koa.Next
        ): Promise<void> => {
          const response = await instance[route.methodName](ctx, next);
          if (response !== undefined) {
            ctx.body = response;
          }
        }
      );
    });
  });
}
