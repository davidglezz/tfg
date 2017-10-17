import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Shop } from './shop.interface';
import { ShopService } from './shop.service';

@Component({
  selector: 'app-shop-info',
  templateUrl: './shop-info.component.html',
  styleUrls: ['./shop-info.component.css']
})
export class ShopInfoComponent implements OnInit {
  shop: Shop;

  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    /*this.route.params.switchMap((params: Params) => this.shopService.getShop(+params['id']))
      .subscribe(shop => this.shop = shop as Shop);*/
  }

  updateShop(): void {
    // this.shopService.updateShop(this.shop);
    this.goBack();
  }

  goBack(): void {
    this.location.back();
  }

}
