import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleAssetComponent } from './simple-asset.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiService } from '../core/account/api.service';
import { EuppTranslateLoader } from '../shared/translation/eupp-translate-loader';
import {
  EuppConfigureTranslateService
} from '../shared/translation/eupp-configure-translate.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslationKeys } from '../shared/translation/translation-keys';
import { SimpleAssetActions } from './simple-asset.actions';
import { FinanceOptionsActions } from '../finance-options/finance-options.actions';
import { SharedModule } from '../shared/shared.module';
import { SimpleAssetEpics } from './simple-asset.epics';

// This Factory is default loader for the Translation
export function translateLoaderFactory(http: HttpClient, apiService: ApiService) {
  return new EuppTranslateLoader(http, apiService);
}

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forRoot(
      {
        loader: {
          provide: TranslateLoader,
          useFactory: translateLoaderFactory,
          deps: [HttpClient, ApiService]
        }
      }
    ),
    SharedModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [SimpleAssetComponent],
  providers: [
    { provide: 'components', useValue: [SimpleAssetComponent], multi: true },
    EuppConfigureTranslateService, TranslationKeys,
    SimpleAssetActions, FinanceOptionsActions, SimpleAssetEpics
  ],
  exports: [SimpleAssetComponent],
  entryComponents: [SimpleAssetComponent]
})
export class SimpleAssetModule { }
