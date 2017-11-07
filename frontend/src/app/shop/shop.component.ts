import { ShopService } from './shop.service';
import { Component, OnInit } from '@angular/core';
import { Shop } from './shop.interface';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {

  }
}
