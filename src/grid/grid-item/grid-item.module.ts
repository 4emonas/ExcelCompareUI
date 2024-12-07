import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridItemComponent } from './grid-item.component';

@NgModule({
  declarations: [GridItemComponent],  // Declare GridItemComponent here
  imports: [CommonModule],  // Import CommonModule if needed
  exports: [GridItemComponent]  // Export it so other modules can use it
})
export class GridItemModule { }