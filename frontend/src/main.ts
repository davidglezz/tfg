import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

import { platformBrowser } from '@angular/platform-browser';
platformBrowser().bootstrapModule(AppModule);
// .then(success => console.log(`Bootstrap success`)).catch(err => console.error(err));
