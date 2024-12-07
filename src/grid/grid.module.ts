import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid.component';
import { GridItemModule } from './grid-item/grid-item.module';  // Import GridItemModule

@NgModule({
  declarations: [GridComponent],
  imports: [CommonModule, GridItemModule],
  exports: [GridComponent]
})
export class GridModule {}