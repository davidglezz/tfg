import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { API } from '../api.config';

@Injectable()
export class BrandService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private endpoint = API.baseHref + '/brands';

    constructor(private http: Http) { }

    getBrandList(): Observable<String[]> {
        const params: RequestOptionsArgs = {
            params: {'type': 'simpleList'}
        }
        return this.http.get(this.endpoint, params)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

}

