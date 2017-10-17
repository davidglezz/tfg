import { Component, EventEmitter, OnInit } from '@angular/core';
import { SearchService } from './search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [SearchService]
})
export class SearchComponent implements OnInit {

  searchEventEmitter: EventEmitter<string>

  constructor(private searchService: SearchService, private router: Router) {
  }

  ngOnInit() {
    this.searchEventEmitter = this.searchService.getQueryValue()
  }

  onFocus() {
    if (!this.router.isActive(this.router.createUrlTree(['/product']), true)) {
      this.router.navigate(['/product'])
    }
  }

}
