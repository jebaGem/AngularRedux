import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EuppTranslateLoader } from '../shared/translation/eupp-translate-loader';
import {
  EuppConfigureTranslateService
} from '../shared/translation/eupp-configure-translate.service';
import { TranslationKeys } from '../shared/translation/translation-keys';
import { SharedModule } from '../shared/shared.module';

import { ApiService } from '../core/account/api.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchCustomerComponent } from './search-customer.component';
import { SearchCustomerActions } from './search-customer.actions';
import { SearchCustomerEpics } from './search-customer.epics';

// This Factory is default loader for the Translation
export function translateLoaderFactory(http: HttpClient, apiService: ApiService) {
  return new EuppTranslateLoader(http, apiService);
}
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule.forRoot(
      {
        loader: {
          provide: TranslateLoader,
          useFactory: translateLoaderFactory,
          deps: [HttpClient, ApiService]
        }
      }
    )
  ],
  declarations: [SearchCustomerComponent],
  providers: [
    { provide: 'components', useValue: [SearchCustomerComponent], multi: true },
    EuppConfigureTranslateService,
    TranslationKeys,
    SearchCustomerActions,
    SearchCustomerEpics
  ],
  exports: [SearchCustomerComponent],
  entryComponents: [SearchCustomerComponent]
})
export class SearchCustomerModule { }
