import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ShopComponent } from './shop/shop.component';
import { ProductComponent } from './product/product.component';
import { ProductInfoComponent } from './product/product-info.component';
import { AboutComponent } from './about/about.component';
import { ShopInfoComponent } from './shop/shop-info.component'
import { ShopEditComponent } from './shop/shop-edit.component'
import { ShopAddComponent } from 'app/shop/shop-add/shop-add.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'shop',
    component: ShopComponent
  },
  {
    path: 'shop/add',
    component: ShopAddComponent
  },
  {
    path: 'shop/:id',
    component: ShopInfoComponent
  },
  {
    path: 'shop/:id/edit',
    component: ShopEditComponent
  },
  {
    path: 'product',
    component: ProductComponent
  },
  {
    path: 'product/:id',
    component: ProductInfoComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'product'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
