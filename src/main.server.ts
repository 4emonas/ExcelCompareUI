import { bootstrapApplication } from '@angular/platform-browser';
import { gridConfig } from './grid/grid.config.server';
import { GridComponent } from './grid/grid.component';

const bootstrap = () => bootstrapApplication(GridComponent, gridConfig);

export default bootstrap;
