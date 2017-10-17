import { Url } from '../url/url.interface';

export interface Product {
    id: number;
    language: string;
    name: string;
    description: string;
    image: string;
    brand: string;
    color: string;
    gtin13: number;
    mpn: string;
    sku: string;
    productID: string;
    price: number;
    priceTotal: number;
    priceCurrency: string;
    ratingValue: number;
    ratingCount: number;
    dateAdd: Date;
    dateUpd: Date;
    urls: Url[];
    [key: string]: any;
}
