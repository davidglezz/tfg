
export interface Shop {
    id?: number;
    hash?: number;
    domain: string;
    name: string;
    shippingCost: number;
    sitemap: string;
    productUpdInterval: number;
    sitemapUpdInterval: number;
    dateAdd?: Date;
    dateUpd?: Date;
    dateNextUpd: Date;
    type: number; // Prestashop, Magento, ...
}
