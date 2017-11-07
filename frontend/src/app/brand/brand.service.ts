import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import { API } from '../api.config';

@Injectable()
export class BrandService {
    private headers = { 'Content-Type': 'application/json' };
    private endpoint = API.baseHref + '/brands';

    constructor(private http: HttpClient) { }

    getBrandList(): Observable<String[]> {
        const options = {
            headers: this.headers,
            params: {'type': 'simpleList'}
        }
        return this.http.get<String[]>(this.endpoint, options)
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

}

