import memoize from "memoizee";

import {
  Controller,
  ButterCollectionParams,
  ButterCollectionSortOrder,
} from "../../service";

@Controller()
export class ButterController {
  protected collectionCallback: Function;
  protected itemCallback: Function;

  protected maxAgeCollection = 24 * 3600 * 1000; // 1 day
  protected maxAgeItem = 24 * 3600 * 1000; // 1 day
  protected defaultSort = "trending";

  constructor(collectionCallback: Function, itemCallback: Function) {
    this.collectionCallback = memoize(collectionCallback, {
      maxAge: this.maxAgeCollection,
      promise: true,
      primitive: true,
      normalizer: JSON.stringify,
    });
    this.itemCallback = memoize(itemCallback, {
      maxAge: this.maxAgeItem,
      promise: true,
      primitive: true,
    });
  }

  protected async getCollection<T>(query: any): Promise<T[]> {
    const page = parseInt(query.page) || 1;
    const params: ButterCollectionParams = {
      sort: query.sort || this.defaultSort,
      genre: query.genre,
      keywords: query.keywords,
    };
    if (query.order !== undefined) {
      params.order =
        query.order === "asc"
          ? ButterCollectionSortOrder.ASC
          : ButterCollectionSortOrder.DESC;
    }

    return await this.collectionCallback(page, params);
  }

  async getItem<T>(id: string): Promise<T | void> {
    const movie = await this.itemCallback(id);
    if (!movie) {
      // 404 - koa default response
      return;
    }
    return movie;
  }
}
