import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

// AOT
// import { platformBrowser } from '@angular/platform-browser';
// platformBrowser().bootstrapModule(AppModule);

// JIT
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
platformBrowserDynamic().bootstrapModule(AppModule);
