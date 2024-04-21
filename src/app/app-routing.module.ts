import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridComponent } from '../grid/grid.component';
import { InfoComponent } from '../info/info.component';
import { ContactComponent } from '../contact/contact.component';

const routes: Routes = [
  {path: '', component:GridComponent},
  {path: 'grid', component:GridComponent},
  {path: 'info', component:InfoComponent},
  {path: 'contact', component:ContactComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
