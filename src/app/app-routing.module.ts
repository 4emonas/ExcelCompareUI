import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridComponent } from '../grid/grid.component';
import { InfoComponent } from '../info/info.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  {path: '', component:AppComponent},
  {path: 'grid', component:GridComponent},
  {path: 'info', component:InfoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
