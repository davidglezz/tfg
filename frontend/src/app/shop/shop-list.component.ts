import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Shop } from './shop.interface';
import { ShopService } from './shop.service';

@Component({
  selector: 'app-shop-list',
  templateUrl: './shop-list.component.html',
  styleUrls: ['./shop-list.component.css']
})
export class ShopListComponent implements OnInit {
  allShops = [] as Shop[]
  shops = [] as Shop[]
  searchQuery: string
  selectedShop: Shop
  newShop: Shop

  constructor(private router: Router, private shopService: ShopService) {

  }

  ngOnInit() {
    this.shopService.getShops().subscribe(shops => {
      this.allShops = shops
      this.shops = shops
    });
  }

  filter() {
    if (this.searchQuery) {
      this.shops = this.allShops.filter(shop => {
        const q = this.searchQuery.toLowerCase();
        return '' + shop.id === q || shop.name.toLowerCase().indexOf(q) >= 0 || shop.domain.toLowerCase().indexOf(q) >= 0
      })
    } else {
      this.shops = this.allShops
    }
  }

  needSeparator(i: number) {
    if (i === 0) {
      return this.shops[i].name.charAt(0).toUpperCase()
    }

    return this.shops[i - 1].name.charAt(0).toUpperCase() !== this.shops[i].name.charAt(0).toUpperCase()
  }

  getSepartorName(i: number) {
    const firstLetter = this.shops[i].name.charAt(0)

    if (firstLetter >= 'a' && firstLetter <= 'z') {
      return firstLetter.toUpperCase();
    }

    if (firstLetter >= 'A' && firstLetter <= 'Z') {
      return firstLetter
    }

    return '-'
  }

}
