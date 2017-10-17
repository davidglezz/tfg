import { Component, OnInit } from '@angular/core';
import { Shop } from './shop.interface';

@Component({
  selector: 'app-shop-add',
  templateUrl: './shop-add.component.html',
  styleUrls: ['./shop-add.component.css']
})
export class ShopAddComponent implements OnInit {

  newShop: Shop
  constructor() { }

  ngOnInit() {
  }

  createShop() {
  }

}
