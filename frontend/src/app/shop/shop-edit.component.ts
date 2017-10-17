import { Component, OnInit } from '@angular/core';
import { Shop } from './shop.interface';

@Component({
  selector: 'app-shop-edit',
  templateUrl: './shop-edit.component.html',
  styleUrls: ['./shop-edit.component.css']
})
export class ShopEditComponent implements OnInit {

  newShop: Shop
  constructor() { }

  ngOnInit() {
  }

  createShop() {
  }


}
