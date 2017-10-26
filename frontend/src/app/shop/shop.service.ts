import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Shop } from './shop.interface'
import { API } from '../api.config';

@Injectable()
export class ShopService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private endpoint = API.baseHref + '/shops';

    constructor(private http: Http) { }

    getShops(page: number = 0, limit: number = 100, orderBy = 'name', orderWay: 'ASC' | 'DESC' = 'ASC'): Observable<Shop[]> {
        const params: RequestOptionsArgs = {
            params: {
                'orderBy': orderBy,
                'orderWay': orderWay,
                'page': page,
                'limit': limit
            }
        }
        return this.http.get(this.endpoint, params)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    getShopsList(): Observable<Shop[]> {
        const params: RequestOptionsArgs = {
            params: {
                'limit': 0,
                'type': 'simple',
                'orderBy': 'name'
            }
        }
        return this.http.get(this.endpoint, params)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    getShopsResultSet(page: number = 0, limit: number = 100): Observable<ResultSet<Shop>> {
        const params: RequestOptionsArgs = {
            params: {
                'page': page,
                'limit': limit
            }
        }
        return this.http.get(this.endpoint, params)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    getShopById(id: number): Observable<Shop> {
        const url = `${this.endpoint}/${id}`;
        return this.http.get(url)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }


    createShop(shop: Shop): Observable<Shop> {
        return this.http
            .post(this.endpoint, JSON.stringify(shop), { headers: this.headers })
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    updateShop(shop: Shop): Observable<Shop> {
        const url = `${this.endpoint}/${shop.id}`;
        return this.http
            .post(url, JSON.stringify(shop), { headers: this.headers })
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    deleteShop(shop: Shop): Observable<void> {
        const url = `${this.endpoint}/${shop.id}`;
        return this.http.delete(url, { headers: this.headers })
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Observable<any> {
        console.error('An error occurred', error);
        return Observable.throw(error.json().error || 'Server error');
    }
}

interface ResultSet<T> {
    result: Array<T>;
    count: number;
}

export interface PartialShop {
    id: number;
    name: string;
    domain: string;
}
