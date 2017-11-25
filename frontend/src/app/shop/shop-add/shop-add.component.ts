import { Component, OnInit } from '@angular/core';
import { Shop } from '../shop.interface';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../shop.service';


@Component({
  selector: 'app-shop-add',
  templateUrl: './shop-add.component.html',
  styleUrls: ['./shop-add.component.css'],
})
export class ShopAddComponent implements OnInit {
  step = 0;
  autodetectUrlArticle = '';
  loading1 = false;
  loading2 = false;
  shop: Shop;

  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  save() {
    this.loading2 = true;
    this.shopService.createShop(this.shop)
      .subscribe(shop => {
        this.loading2 = false;
        this.router.navigate(['/shop', shop.id]);
      });
  }

  skip() {
    this.shop = {
      vatFix: 1,
      type: 0,
      active: true,
      sitemapUpdInterval: 86400000,
      productUpdInterval: 86400000,
      comment: 'SuggestShopByUrl',
      dateNextUpd: new Date(0),
      shippingCost: 0,
      domain: '',
      sitemap: '',
      name: '',
    } as Shop;

    this.step = 1;
  }

  autodetect() {
    const href = 'https://www.orbitadigital.com/es/cctv/4861-sp955b-box-caja-de-conexiones-para-camaras.html'
    this.loading1 = true;
    this.shopService.getSuggestion(this.autodetectUrlArticle).subscribe(shop => {
      this.shop = shop
      this.step = 1
      this.loading1 = false
    });
  }



}
