import HttpMethod from "http-method-enum";
import { CONTROLLER_ROUTES_METADATA } from "../constants";
import { isString } from "util";

export interface RouteInterface {
  httpMethod: HttpMethod;
  path: string;
  methodName: string;
}

export function MethodMapping(
  method: HttpMethod,
  path?: string
): MethodDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    if (!isString(propertyKey)) {
      return;
    }

    if (!Reflect.hasMetadata(CONTROLLER_ROUTES_METADATA, target.constructor)) {
      Reflect.defineMetadata(
        CONTROLLER_ROUTES_METADATA,
        [],
        target.constructor
      );
    }
    const routes: RouteInterface[] = Reflect.getMetadata(
      CONTROLLER_ROUTES_METADATA,
      target.constructor
    );

    routes.push({
      path: path || "/",
      methodName: propertyKey,
      httpMethod: method,
    });

    Reflect.defineMetadata(
      CONTROLLER_ROUTES_METADATA,
      routes,
      target.constructor
    );
  };
}

function createMappingDecorator(
  method: HttpMethod
): (path: string) => MethodDecorator {
  return (path: string): MethodDecorator => {
    return MethodMapping(method, path);
  };
}

export const Get = createMappingDecorator(HttpMethod.GET);
export const Post = createMappingDecorator(HttpMethod.POST);
export const Put = createMappingDecorator(HttpMethod.PUT);
