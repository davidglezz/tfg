import { Component, OnInit, Input } from '@angular/core';
import { Product } from './product.interface';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css']
})
export class ProductItemComponent implements OnInit {
  @Input()
  item: Product;
  constructor() { }

  ngOnInit() {
  }

  goToProductDetails(id) {
    // this.router.navigate(['/product', id]);
  }

}
