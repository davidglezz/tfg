import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class SearchService {

  private static queryValue

  constructor() { }

  getQueryValue() {
    if (!SearchService.queryValue) {
      SearchService.queryValue = new EventEmitter<string>(true)
    }

    return SearchService.queryValue
  }

}
