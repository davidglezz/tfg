import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Url } from './url.interface'
import { API } from '../api.config';

@Injectable()
export class UrlService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private baseUri = API.baseHref + '/shop/urls';

    constructor(private http: Http) { }

    getUrls(skip: number = 0, limit: number = 100): Observable<Url[]> {
        const params: RequestOptionsArgs = {
            params: {
                'skip': skip,
                'limit': limit
            }
        }
        return this.http.get(this.baseUri, params)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getUrlsResultSet(page: number = 0, limit: number = 100): Observable<ResultSet<Url>> {
        const params: RequestOptionsArgs = {
            params: {
                'page': page,
                'limit': limit
            }
        }
        return this.http.get(this.baseUri, params)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getUrlById(id: number): Promise<Url> {
        const uri = `${this.baseUri}/${id}`;
        return this.http.get(uri)
            .toPromise()
            .then(response => response.json().data as Url)
            .catch(this.handleError);
    }


    createUrl(url: Url): Promise<Url> {
        return this.http
            .post(this.baseUri, JSON.stringify(url), { headers: this.headers })
            .toPromise()
            .then(res => res.json().data as Url)
            .catch(this.handleError);
    }

    updateUrl(url: Url): Promise<Url> {
        const uri = `${this.baseUri}/${url.hash}`;
        return this.http
            .put(uri, JSON.stringify(url), { headers: this.headers })
            .toPromise()
            .then(() => url)
            .catch(this.handleError);
    }

    deleteUrl(url: Url): Promise<void> {
        const uri = `${this.baseUri}/${url.hash}`;
        return this.http.delete(uri, { headers: this.headers })
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}

interface ResultSet<T> {
    result: Array<T>;
    count: number;
}
