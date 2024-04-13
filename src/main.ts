import { bootstrapApplication } from '@angular/platform-browser';
import { gridAppConfig } from './grid/grid.config';
import { GridComponent } from './grid/grid.component';

bootstrapApplication(GridComponent, gridAppConfig)
  .catch((err) => console.error(err));