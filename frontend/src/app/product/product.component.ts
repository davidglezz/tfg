import { ChangeEvent } from 'angular2-virtual-scroll/dist/virtual-scroll';
import { Component, Input, OnChanges, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Http } from '@angular/http';
import { Product } from './product.interface';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';
import { ProductService, ProductFilter } from './product.service';
import { BrandService } from '../brand/brand.service';
import { ShopService, PartialShop } from '../shop/shop.service';
import { SearchService } from '../search/search.service';
import { Observable } from 'rxjs/Rx';
import { Url } from '../url/url.interface';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ProductService, BrandService, SearchService, ShopService]
})
export class ProductComponent implements OnInit, OnChanges {

  // Product List
  noMoreProducts: boolean;
  items: Url[];
  scrollItems: Url[];
  indices: ChangeEvent;
  pageSize = 48;
  loading = false;
  lastFetch = 0;
  @ViewChild('productVirtualScroll')
  productVirtualScroll: VirtualScrollComponent;

  // Filters
  @ViewChild('filterShops') filterShops;
  @ViewChild('filterBrand') filterBrand;
  @ViewChild('filterAvailability') filterAvailability;
  @ViewChild('filterLanguage') filterLanguage;

  productFilter = {} as ProductFilter;
  filter = {
    'price': {
      'active': false,
      'data': {
        'min': null,
        'max': null
      }
    },
    'rating': {
      'active': false,
      'data': 1
    },
    'shop': {
      'active': false,
      'data': []
    },
    'brand': {
      'active': false,
      'data': {}
    },
    'availability': {
      'active': false,
      'data': {
        'Discontinued': false,
        'InStock': true,
        'InStoreOnly': false,
        'LimitedAvailability': false,
        'OnlineOnly': true,
        'OutOfStock': false,
        'PreOrder': false,
        'PreSale': false,
        'SoldOut': false,
      }
    },
    'language': {
      'active': false,
      'data': {}
    },
    'search': {
      'active': false,
      'data': ''
    }
  }
  constructor(
    private productService: ProductService,
    private shopService: ShopService,
    private brandService: BrandService,
    private searchService: SearchService) { }

  ngOnInit() {
    this.setSearchListener()
    this.shopService.getShopsList().subscribe(list => {
      // const result = []
      // list.forEach(shop => result[shop.id as number] = shop)
      // this.filter.shop.data = result
      this.filter.shop.data = list
      // console.log(this.filter.shop.data)
    });

    this.brandService.getBrandList().subscribe(list => {
      const result = {}
      list.forEach(brand => result[brand as string] = false)
      this.filter.brand.data = result
    });

    this.productService.getLanguages().subscribe(list => {
      const result = {}
      list.forEach(language => result[language as string] = false)
      this.filter.language.data = result
    });

    this.reset();
  }

  ngOnChanges() {
    this.reset();
  }

  // call this function after resize + animation end
  afterResize() {
    this.productVirtualScroll.refresh();
  }

  reset() {
    this.indices = { start: 0, end: this.pageSize }
    this.noMoreProducts = false
    this.loading = true;
    this.productService
      .getProducts(0, this.pageSize, this.productFilter)
      .subscribe(data => this.items = data.map(product => ({ product }) ) as Url[], console.error, () => {
        this.loading = false
        this.productVirtualScroll.refresh()
        if (this.items && this.items.length) {
          this.productVirtualScroll.scrollInto(this.items[0]);
        }
      })

    // Esto deberia fincionar, pero no
    // this.items = []
    // this.fetchMore({ start: 0, end: this.pageSize })
  }

  fetchMore(event: ChangeEvent) {
    this.indices = event;
    if (!this.noMoreProducts && !this.loading && event.end === this.items.length) {
      this.loading = true;
      const nbProducts = this.items.length
      this.productService
        .getProducts(this.items.length, this.pageSize, this.productFilter)
        .subscribe(data => this.items = this.items.concat(data.map((product) => ({ product })) as Url[]), console.error, () => {
          this.loading = false
          this.noMoreProducts = nbProducts === this.items.length
        })
    }
  }

  setSearchListener(): any {
    this.searchService.getQueryValue()
      .debounce(() => Observable.timer(250))
      .distinctUntilChanged()
      .subscribe((term) => {
        if (term) {
          this.filter.search.active = true
          this.filter.search.data = term.trim()
        } else {
          this.filter.search.active = false
          this.filter.search.data = ''
        }
        this.updateFilter()
      });
  }

  log(value: any) {
    console.log(value)
  }

  setFilter(name: string, status: boolean) {
    this.filter[name].active = status
    this.updateFilter()
  }

  updateFilter() {
    const newFilter = this.getFilter();
    if (JSON.stringify(newFilter) !== JSON.stringify(this.productFilter)) {
      this.productFilter = newFilter
      this.reset()
    }

  }

  /**
   * Genera un objeto ProductFilter con los valores de los filtros
   */
  getFilter() {
    const filter = {} as ProductFilter;

    if (this.filter.price.active) {
      if (this.filter.price.data.min) {
        filter.priceMin = this.filter.price.data.min
      }
      if (this.filter.price.data.max) {
        filter.priceMax = this.filter.price.data.max
      }
    }

    if (this.filter.rating.active && this.filter.rating.data) {
      filter.rating = this.filter.rating.data
    }

    if (this.filter.shop.active
      && this.filterShops.selectedOptions.selected.length > 0
      && this.filterShops.selectedOptions.selected.length < this.filter.shop.data.length) {
      filter.shop = this.filterShops.selectedOptions.selected.map(listOption => listOption.value)
    }

    if (this.filter.brand.active
      && this.filterBrand.selectedOptions.selected.length > 0
      && this.filterBrand.selectedOptions.selected.length < Object.keys(this.filter.brand.data).length) {
      filter.brand = this.filterBrand.selectedOptions.selected.map(listOption => listOption.value)
    }

    if (this.filter.availability.active
      && this.filterAvailability.selectedOptions.selected.length > 0
      && this.filterAvailability.selectedOptions.selected.length < Object.keys(this.filter.availability.data).length) {
      filter.availability = this.filterAvailability.selectedOptions.selected.map(listOption => listOption.value)
    }

    if (this.filter.language.active
      && this.filterLanguage.selectedOptions.selected.length > 0
      && this.filterLanguage.selectedOptions.selected.length < Object.keys(this.filter.language.data).length) {
      filter.language = this.filterLanguage.selectedOptions.selected.map(listOption => listOption.value)
    }

    if (this.filter.search.active && this.filter.search.data) {
      filter.search = this.filter.search.data
    }

    // console.log(filter)
    return filter;
  }


}


