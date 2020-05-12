import { CONTROLLER_PREFIX_METADATA } from "../constants";

export const Controller = (prefix: string = ""): ClassDecorator => {
  return (target: any): void => {
    Reflect.defineMetadata(CONTROLLER_PREFIX_METADATA, prefix, target);
  };
};
