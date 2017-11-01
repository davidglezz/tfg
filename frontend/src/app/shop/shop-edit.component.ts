import { Component, OnInit } from '@angular/core';
import { Shop } from './shop.interface';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ShopService } from './shop.service';

@Component({
  selector: 'app-shop-edit',
  templateUrl: './shop-edit.component.html',
  styleUrls: ['./shop-edit.component.css']
})
export class ShopEditComponent implements OnInit {
  shop: Shop;
  isNew: boolean;

  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isNew = this.router.isActive(this.router.createUrlTree(['/shop', 'add']), true);
    if (!this.isNew) {
      this.route.params
        .switchMap((params: Params) => this.shopService.getShopById(+params['id']))
        .subscribe(shop => this.shop = shop as Shop);
    } else {
      this.shop = {} as Shop
    }
  }

  save() {
    if (!this.isNew) {
      this.shop.dateNextUpd = undefined; // TODO
      this.shop.dateAdd = undefined;
      this.shop.dateUpd = undefined;
      this.shopService.updateShop(this.shop)
        .subscribe(shop => {
          this.router.navigate(['/shop', shop.id]);
        });
    } else {
      this.shopService.createShop(this.shop)
        .subscribe(shop => {
          this.router.navigate(['/shop', shop.id]);
        });
    }

  }

}
