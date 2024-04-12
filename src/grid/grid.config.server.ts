import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { gridAppConfig } from './grid.config';

const serverConfig: ApplicationConfig = { 
  providers: [
    provideServerRendering()
  ]
};

export const gridConfig = mergeApplicationConfig(gridAppConfig, serverConfig);
