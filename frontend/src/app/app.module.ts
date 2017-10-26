import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { MATERIAL_COMPATIBILITY_MODE } from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table'
import { OverlayModule } from '@angular/cdk/overlay';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import 'hammerjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { AppComponent/*, DialogContent*/ } from './app.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShopComponent } from './shop/shop.component';
import { ShopInfoComponent } from './shop/shop-info.component';
import { ShopListComponent } from './shop/shop-list.component';
import { ProductComponent } from './product/product.component';
import { ProductItemComponent } from './product/product-item.component';
import { ProductInfoComponent } from './product/product-info.component';
import { UrlComponent } from './url/url.component';
import { ShopService } from './shop/shop.service';
import { ProductService } from './product/product.service';
import { UrlService } from './url/url.service';
import { BrandService } from './brand/brand.service';
import { DefaultPicturePipe } from './default-picture.pipe';
import { ShopEditComponent } from './shop/shop-edit.component';
import { AboutComponent } from './about/about.component';
import { ObjectKeysPipe } from './object-keys.pipe';
import { SearchComponent } from './search/search.component';
import { TimespanPipe } from './timespan.pipe';

@NgModule({
  declarations: [
    AppComponent,
    /*DialogContent,*/
    SidenavComponent,
    DashboardComponent,
    ShopComponent,
    ShopInfoComponent,
    ShopListComponent,
    ProductComponent,
    UrlComponent,
    ProductItemComponent,
    ProductInfoComponent,
    DefaultPicturePipe,
    ShopEditComponent,
    AboutComponent,
    ObjectKeysPipe,
    SearchComponent,
    TimespanPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxDatatableModule,
    ChartsModule,
    VirtualScrollModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  exports: [
    DefaultPicturePipe,

    // CDk
    CdkTableModule,
    OverlayModule,

    // Material
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatNativeDateModule,
  ],
  providers: [
    ShopService,
    ProductService,
    UrlService,
    BrandService,
    { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true }
  ],
  entryComponents: [/*DialogContent*/],
  bootstrap: [AppComponent]
})
export class AppModule { }
