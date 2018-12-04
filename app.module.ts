import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import localeSv from '@angular/common/locales/sv';
import { AppRoutingModule } from './shared/routes/routes.module';
import { NgReduxModule } from '@angular-redux/store';
import { StoreModule } from './store';
import { AppComponent } from './app.component';

import { SummaryBarModule } from './summary-bar/summary-bar.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { OverviewModule } from './overview/overview.module';
import { MyDealsModule } from './my-deals/my-deals.module';


registerLocaleData(localeNl, 'nl');
registerLocaleData(localeSv, 'sv');

@NgModule({
  bootstrap: [
    AppComponent
  ],
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgReduxModule,
    StoreModule,
    MyDealsModule,
    SharedModule, // TODO: Decouple the spinner component from the SharedModule
    SummaryBarModule,
    AppRoutingModule,
    OverviewModule,
    BrowserAnimationsModule,
    CoreModule.forRoot()
  ]
})
export class AppModule {
}
