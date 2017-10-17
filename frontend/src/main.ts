import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}


/**
 * JIT compile.
 */
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
platformBrowserDynamic().bootstrapModule(AppModule);
// .then(success => console.log(`Bootstrap success`)).catch(err => console.error(err));

/**
 * AoT compile.
 * First run `./node_modules/.bin/ngc -p ./src/`
 */
// import { platformBrowser } from '@angular/platform-browser';
// import { MaterialAppModuleNgFactory } from './aot/app/app.module.ngfactory';
// platformBrowser().bootstrapModuleFactory(MaterialAppModuleNgFactory);


