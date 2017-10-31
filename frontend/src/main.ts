import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { getTranslationProviders } from './app/i18n-providers';


if (environment.production) {
  enableProdMode();
}


/**
 * JIT compile.
 */
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
// platformBrowserDynamic().bootstrapModule(AppModule);
// .then(success => console.log(`Bootstrap success`)).catch(err => console.error(err));
getTranslationProviders().then(providers => {
  console.log(providers);
  const options = { providers };
  platformBrowserDynamic().bootstrapModule(AppModule, options);
});

/**
 * AoT compile.
 * First run `./node_modules/.bin/ngc -p ./src/`
 */
// import { platformBrowser } from '@angular/platform-browser';
// import { MaterialAppModuleNgFactory } from './aot/app/app.module.ngfactory';
// platformBrowser().bootstrapModuleFactory(MaterialAppModuleNgFactory);


