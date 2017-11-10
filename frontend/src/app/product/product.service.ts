import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import { Product } from './product.interface'
import { API } from '../api.config';
import { Url } from '../url/url.interface';

@Injectable()
export class ProductService {
    private headers = { 'Content-Type': 'application/json' };
    private endpoint = API.baseHref + '/products';

    constructor(private http: HttpClient) { }

    getProducts(skip = 0, limit = 100, orderBy: string, orderWay: 'ASC' | 'DESC' = 'ASC', filter?: ProductFilter): Observable<Product[]> {
        const options = {
            headers: this.headers,
            params: {
                'skip': String(skip),
                'limit': String(limit),
                'orderBy': orderBy,
                'orderWay': orderWay,
                'filter': encodeURI(filter ? JSON.stringify(filter) : '{}')
            }
        }
        return this.http.get<Product[]>(this.endpoint, options)
            .catch(error => {
                console.error('Error in HttpClient', error);
                return Observable.of([] as Product[]);
            })
    }

    getProductById(id: number): Observable<Product> {
        const url = `${this.endpoint}/${id}`;
        return this.http.get(url, { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }

    getProductUrls(id: number): Observable<Url[]> {
        const url = `${this.endpoint}/${id}/urls`;
        return this.http.get(url, { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }


    getProductPrices(productId: number, shopId: number, urlHash: number) {
        const url = `${this.endpoint}/${productId}/url/${shopId}-${urlHash}/prices`;
        return this.http.get(url, { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }

    getSimilarProduct(id: number): Observable<Url[]> {
        const url = `${this.endpoint}/${id}/similar`;
        return this.http.get(url, { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'))
    }

    getLanguages(): Observable<String[]> {
        return this.http.get<String[]>(this.endpoint + '/languages', { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
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
