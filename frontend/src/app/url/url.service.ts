import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import { Url } from './url.interface'
import { API } from '../api.config';

@Injectable()
export class UrlService {
    private headers = { 'Content-Type': 'application/json' };
    private baseUri = API.baseHref + '/shop/urls';

    constructor(private http: HttpClient) { }

    getUrls(skip: number = 0, limit: number = 100): Observable<Url[]> {
        const options = {
            headers: this.headers,
            params: {
                'skip': String(skip),
                'limit': String(limit)
            }
        }
        return this.http.get<Url[]>(this.baseUri, options)
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    getUrlById(id: number): Observable<Url> {
        const uri = `${this.baseUri}/${id}`;
        return this.http.get<Url>(uri, { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    createUrl(url: Url): Observable<Url> {
        return this.http.post<Url>(this.baseUri, JSON.stringify(url), { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    updateUrl(url: Url): Observable<Url> {
        const uri = `${this.baseUri}/${url.hash}`;
        return this.http.put<Url>(uri, JSON.stringify(url), { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    deleteUrl(url: Url): Observable<Url> {
        const uri = `${this.baseUri}/${url.hash}`;
        return this.http.delete<Url>(uri, { headers: this.headers })
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}

interface ResultSet<T> {
    result: Array<T>;
    count: number;
}
