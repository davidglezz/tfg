import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

// Prod
import { platformBrowser } from '@angular/platform-browser';
platformBrowser().bootstrapModule(AppModule);

// Dev
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// platformBrowserDynamic().bootstrapModule(AppModule);
