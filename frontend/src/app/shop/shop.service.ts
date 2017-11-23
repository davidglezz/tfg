import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import { Shop } from './shop.interface'
import { API } from '../api.config';

@Injectable()
export class ShopService {
  private headers = { 'Content-Type': 'application/json' };
  private endpoint = API.baseHref + '/shops';

  constructor(private http: HttpClient) { }

  getShops(page: number = 0, limit: number = 100, orderBy = 'name', orderWay: 'ASC' | 'DESC' = 'ASC'): Observable<Shop[]> {
    const options = {
      headers: this.headers,
      params: {
        'orderBy': String(orderBy),
        'orderWay': String(orderWay),
        'page': String(page),
        'limit': String(limit)
      }
    }
    return this.http.get<Shop[]>(this.endpoint, options)
      .catch(this.handleError);
  }

  getShopsList(): Observable<Shop[]> {
    const options = {
      headers: this.headers,
      params: {
        'limit': '0',
        'type': 'simple',
        'orderBy': 'name'
      }
    }
    return this.http.get<Shop[]>(this.endpoint, options)
      .catch(this.handleError);
  }

  getShopById(id: number): Observable<Shop> {
    const url = `${this.endpoint}/${id}`;
    return this.http.get(url, { headers: this.headers })
      .catch(this.handleError);
  }


  createShop(shop: Shop): Observable<Shop> {
    return this.http
      .post(this.endpoint, JSON.stringify(shop), { headers: this.headers })
      .catch(this.handleError);
  }

  updateShop(shop: Shop): Observable<Shop> {
    const url = `${this.endpoint}/${shop.id}`;
    return this.http
      .post(url, JSON.stringify(shop), { headers: this.headers })
      .catch(this.handleError);
  }

  deleteShop(shop: Shop): Observable<void> {
    const url = `${this.endpoint}/${shop.id}`;
    return this.http.delete(url, { headers: this.headers })
      .catch(this.handleError);
  }

  getSuggestion(url: string): Observable<Shop> {
    const endpoint = `${this.endpoint}/suggestions`;
    const options = {
      headers: this.headers,
      params: { 'url': encodeURI(url) }
    }
    return this.http.get<Shop[]>(endpoint, options)
      .catch(this.handleError);
  }

  private handleError(error: any): Observable<any> {
    console.error('An error occurred', error);
    return Observable.throw(error.json().error || 'Server error');
  }
}

export interface PartialShop {
  id: number;
  name: string;
  domain: string;
}
