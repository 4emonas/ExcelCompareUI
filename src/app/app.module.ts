import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GridComponent } from '../grid/grid.component';
import { GridModule } from '../grid/grid.module';
import { InfoComponent } from '../info/info.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { ContactComponent } from '../contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    InfoComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GridModule,
    HttpClientModule
  ],
  providers: [
    provideHttpClient(withFetch()),
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
