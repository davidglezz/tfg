import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Product } from './product.interface';
import { ProductService } from './product.service';
import { Url } from '../url/url.interface'
import { UrlService } from '../url/url.service';
import { Observable } from 'rxjs/Rx';
import { Price } from 'app/product/price.interface';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  styleUrls: ['./product-info.component.css']
})
export class ProductInfoComponent implements OnInit {
  product = {} as Product;
  urls: Url[] = []
  similar: Url[] = []
  prices = {}
  isLoading = true

  SingleProperties = ['language', 'color', 'gtin13', 'mpn', 'sku', 'productID']

  constructor(
    private productService: ProductService,
    private urlService: UrlService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.isLoading = true
    this.route.params
      .switchMap(params => this.productService.getProductById(+params['id']))
      .subscribe(product => {
        this.product = product
        this.isLoading = false
      }, console.error);

    this.route.params
      .switchMap(params => this.productService.getProductUrls(+params['id']))
      .subscribe(urls => {
        this.urls = urls

        // TODO mejorar, hacer bien
        if (urls && urls.length) {
          const u = urls[0] // Solo la primera tienda, por ahora.

          this.route.params
            .switchMap(params => this.productService.getProductPrices(+params['id'], u.shop.id, u.hash))
            .subscribe(prices => {
              this.prices = {
                values: [
                  {
                    data: prices.map(v => ({ t: new Date(v.date), y: v.priceTotal })),
                    label: 'Total aproximado',
                    steppedLine: true,
                    fill: false
                  },
                  {
                    data: prices.map(v => ({ t: new Date(v.date), y: v.price })),
                    label: 'Precio',
                    steppedLine: true,
                    fill: false
                  }
                ],
                labels: prices.map(v => new Date(v.date).toISOString().slice(0, 16).replace('T', ' ') ),
                options: { // TODO http://www.chartjs.org/docs/latest/axes/cartesian/time.html
                  responsive: true,
                  scales: {
                    xAxes: [{
                      time: {
                        unit: 'day'
                      }
                    }],
                    yAxes: [{
                      ticks: {
                        beginAtZero: true
                      }
                    }]
                  }
                }
              }
              // console.log(this.prices)
            }, console.error);
        }
      })

    this.route.params
      .switchMap(params => this.productService.getSimilarProduct(+params['id']))
      .subscribe(similar => {
        this.similar = similar
      }, console.error);
  }

  updateShop(): void {
    // this.shopService.updateShop(this.shop);
    this.goBack();
  }

  goBack(): void {
    this.location.back();
  }
}
