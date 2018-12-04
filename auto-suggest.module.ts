import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoSuggestComponent } from './auto-suggest.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideDirective } from './drop-down-directive';
import { SearchFilterPipe } from './filter.pipe';
import { LetterBoldPipe } from './letter.bold';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { EuppTranslateLoader } from '../translation/eupp-translate-loader';
import { ApiService } from '../../core/account/api.service';

// This Factory is default loader for the Translation
export function translateLoaderFactory(http: HttpClient, apiService: ApiService) {
  return new EuppTranslateLoader(http, apiService);
}

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [AutoSuggestComponent,
    ClickOutsideDirective,
    SearchFilterPipe,
    LetterBoldPipe],
  providers: [
    { provide: 'components', useValue: [AutoSuggestComponent], multi: true },
    SearchFilterPipe
  ],
  entryComponents: [AutoSuggestComponent],
  exports: [AutoSuggestComponent, SearchFilterPipe]
})
export class AutoSuggestModule { }
