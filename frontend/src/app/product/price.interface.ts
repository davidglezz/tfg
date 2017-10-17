import { Url } from '../url/url.interface';

export interface Price {
    date: Date;
    url?: Url;
    price: number;
    priceTotal: number;
}
