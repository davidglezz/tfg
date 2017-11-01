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
import { FormControl } from '@angular/forms';

const COMMA = 188, ENTER = 13;

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

  separatorKeysCodes = [ENTER, COMMA];

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
      'data': {
        'selected': [],
        'all': [],
        'value': '',
        'filtered': []
      },
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
    this.reset();
    this.setSearchListener()
    this.shopService.getShopsList().subscribe(list => this.filter.shop.data = list);
    this.brandService.getBrandList().subscribe(list => this.filter.brand.data.all = list);

    this.productService.getLanguages().subscribe(list => {
      const result = {}
      list.forEach(language => result[language as string] = false)
      this.filter.language.data = result
    });
  }

  filterBrands(query) {
    let nbResults = 0;
    query = query.toLowerCase();
    this.filter.brand.data.filtered = this.filter.brand.data.all.filter((value: any, index: number, array: any[]) => {
      return this.filter.brand.data.selected.indexOf(value) < 0 && this.fuzzysearch(query, value.toLowerCase()) && ++nbResults < 25
    })
  }

  filterBrandsAdd(event: any): boolean {
    if (this.separatorKeysCodes.indexOf(event.keyCode) < 0) {
      return;
    }

    const input = event.target;
    const value = (event.target.value || '').trim().toLowerCase();

    if (value) {
      const newBrand = this.filter.brand.data.all.find(brand => {
        return this.filter.brand.data.selected.indexOf(brand) < 0 && this.fuzzysearch(value, brand.toLowerCase())
      })

      if (newBrand) {
        this.filter.brand.data.selected.push(newBrand);
        // Reset the input value
        if (input) {
          input.value = '';
        }
      }
    }

    this.updateFilter()

    event.preventDefault();
    return false;
  }

  filterBrandsRemove(item: any): void {
    const index = this.filter.brand.data.selected.indexOf(item);

    if (index >= 0) {
      this.filter.brand.data.selected.splice(index, 1);
    }
  }

  ngOnChanges() {
    this.reset();
  }

  // Call this function after resize + animation end
  afterResize() {
    this.productVirtualScroll.refresh();
  }

  reset() {
    this.indices = { start: 0, end: this.pageSize }
    this.noMoreProducts = false
    this.loading = true;
    this.productService
      .getProducts(0, this.pageSize, this.productFilter)
      .subscribe(data => this.items = data.map(product => ({ product })) as Url[], console.error, () => {
        this.loading = false
        this.productVirtualScroll.refresh()
        if (this.items && this.items.length) {
          this.productVirtualScroll.scrollInto(this.items[0]);
        }
      })

    // This should work, but not
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
      && this.filter.brand.data.selected.length > 0) {
      filter.brand = this.filter.brand.data.selected
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

  // https://github.com/bevacqua/fuzzysearch/
  fuzzysearch(needle, haystack) {
    const hlen = haystack.length;
    const nlen = needle.length;
    if (nlen > hlen) {
      return false;
    }
    if (nlen === hlen) {
      return needle === haystack;
    }
    outer: for (let i = 0, j = 0; i < nlen; i++) {
      const nch = needle.charCodeAt(i);
      while (j < hlen) {
        if (haystack.charCodeAt(j++) === nch) {
          continue outer;
        }
      }
      return false;
    }
    return true;
  }


}


