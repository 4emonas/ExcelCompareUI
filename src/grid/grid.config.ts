import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './grid.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Import HttpClientModule from @angular/common/http in AppModule
import {HttpClientModule} from '@angular/common/http';


//in place where you wanted to use `HttpClient`
import { provideHttpClient, withFetch } from '@angular/common/http'; 

export const gridAppConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()), provideRouter(routes), provideClientHydration(), provideAnimationsAsync()]
};