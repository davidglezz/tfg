import { Shop } from '../shop/Shop.interface';
import { Product } from '../product/product.interface';

export interface Url {
    shop: Shop;
    hash: number;
    href: string;
    dateAdd: Date;
    dateUpd: Date;
    dateNextUpd: Date;
    product?: Product;
}
