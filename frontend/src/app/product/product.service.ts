import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Product } from './product.interface'
import { API } from '../api.config';
import { Url } from '../url/url.interface';

@Injectable()
export class ProductService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private endpoint = API.baseHref + '/products';

    constructor(private http: Http) { }

    getProducts(skip: number = 0, limit: number = 100, filter?: ProductFilter): Observable<Product[]> {
        const params: RequestOptionsArgs = {
            params: {
                'skip': skip,
                'limit': limit,
                'filter': encodeURI(filter ? JSON.stringify(filter) : '{}')
            }
        }
        // console.log(params.params)

        return this.http.get(this.endpoint, params)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getProductsResultSet(page: number = 0, limit: number = 100): Observable<ResultSet<Product>> {
        const params: RequestOptionsArgs = {
            params: {
                'page': page,
                'limit': limit
            }
        }
        return this.http.get(this.endpoint, params)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getProductById(id: number): Observable<Product> {
        const url = `${this.endpoint}/${id}`;
        return this.http.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
        // .catch(this.handleError);
    }

    getProductUrls(id: number): Observable<Url[]> {
        const url = `${this.endpoint}/${id}/urls`;
        return this.http.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
        // .catch(this.handleError);
    }


    getProductPrices(productId: number, shopId: number, urlHash: number) {
        const url = `${this.endpoint}/${productId}/url/${shopId}-${urlHash}/prices`;
        return this.http.get(url)
            .map((res: Response) => res.json()) // TODO: Angular 4.3 uses JSON response by default
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }

    getSimilarProduct(id: number): Observable<Url[]> {
        const url = `${this.endpoint}/${id}/similar`;
        return this.http.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
        // .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    getLanguages(): Observable<String[]> {
        return this.http.get(this.endpoint + '/languages')
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}

interface ResultSet<T> {
    result: Array<T>;
    count: number;
}


export interface ProductFilter {
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    shop?: number[];
    brand?: string[];
    availability?: string[];
    language?: string[];
    search?: string;
}
