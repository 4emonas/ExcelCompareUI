import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './grid.component';
import { GridItemModule } from './grid-item/grid-item.module';  // Import GridItemModule

@NgModule({
  declarations: [GridComponent],  // Declare GridComponent here
  imports: [CommonModule, GridItemModule],  // Import GridItemModule so GridItemComponent can be used
  exports: [GridComponent]
})
export class GridModule {}