import { ShopService } from './shop.service';
import { Component, OnInit } from '@angular/core';
import { Shop } from './shop.interface';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
  providers: [ShopService]
})
export class ShopComponent implements OnInit {
  rows: Array<Shop> = [];
  cache: any = {};
  page: Page = new Page();
  sort: ColumnSort = { 'prop': 'id', 'dir': 'asc' };

  columns = [
    { prop: 'id', name: 'ID' },
    { prop: 'href', name: 'Url' },
    { prop: 'type', name: 'Type' },
    { prop: 'dateAdd', name: 'Type' },
    { prop: 'dateUpd', name: 'Type' },
    { prop: 'hash', name: 'Type' }
  ];

  loading = false;

  constructor(private shopService: ShopService) {
    this.page.pageNumber = 2;
    this.page.size = 1;
    this.page.totalElements = 3;
    this.page.totalPages = 3;
  }

  ngOnInit() {
    // this.update();
  }

  update() {
    this.loading = true;
    this.shopService.getShopsResultSet(this.page.pageNumber, this.page.size)
      .subscribe(data => {
        this.page.setTotalElements(data.count);
        const start = this.page.pageNumber * this.page.size;
        const rows = [...this.rows];
        rows.splice(start, 0, ...data.result);
        this.rows = rows;
        this.cache[this.page.pageNumber] = true;
        this.loading = false;
        // console.log(this.rows);
      });
  }

  /**
   * Populate the table with new data based on the page number
   * @param pageInfo The page to select object{count, limit, offset, pageSize}
   */
  setPage(pageInfo: any) {
    console.log('setPage Event', pageInfo);
    this.page.pageNumber = pageInfo.offset;

    // cache results
    /*if (this.cache[this.page.pageNumber]) {
      return
    };*/
    this.update();
  }

  onSort(shortInfo) {
    console.log('Sort Event', shortInfo);
    this.page.pageNumber = 0;
    this.sort = shortInfo.sorts[0];
    this.cache = [];
    this.update();
  }

}

export class Page {
  // The number of elements in the page
  size = 10;
  // The total number of elements
  totalElements = 0;
  // The total number of pages
  totalPages = 0;
  // The current page number
  pageNumber = 0;

  public setTotalElements(n: number) {
    this.totalElements = n;
    this.totalPages = Math.ceil(n / this.size);
  }
}

interface ColumnSort {
  prop: String;
  dir: 'asc' | 'desc';
}
