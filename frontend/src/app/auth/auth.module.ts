import { ModuleWithProviders, NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import { RouterModule } from '@angular/router';
// import { SharedModule } from '../shared/shared.module';
// import { CommonModule } from '@angular/common';

const authRouting: ModuleWithProviders = RouterModule.forChild([
  {
    path: 'login',
    component: AuthComponent
  },
  {
    path: 'register',
    component: AuthComponent
  }
]);

@NgModule({
  imports: [
    authRouting,
    // CommonModule,
    // SharedModule
  ],
  declarations: [AuthComponent],
  providers: []
})
export class AuthModule { }

