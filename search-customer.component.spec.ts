import {
  async,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { SearchCustomerComponent } from './search-customer.component';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TranslationKeys } from '../shared/translation/translation-keys';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserModule } from '@angular/platform-browser';
import { NgReduxTestingModule, MockNgRedux } from '@angular-redux/store/testing';
import { NgReduxModule } from '@angular-redux/store';
import {
  EuppConfigureTranslateService
} from '../shared/translation/eupp-configure-translate.service';
import { SearchCustomerActions } from './search-customer.actions';
import { MockTranslateService } from '../shared/mocks/translate-service.mock';
import { SharedModule } from '../shared/shared.module';
import { SearchLoadingState } from './search-customer.state';
import { IRootState } from '../store/root.state';
import { StringConstants } from '../shared/string-constants';

const using = require('jasmine-data-provider');

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/data/translations/', '.json');
}

describe('SearchCustomerComponent', () => {
  let component: SearchCustomerComponent;
  let fixture: ComponentFixture<SearchCustomerComponent>;

  beforeEach(
    async(() => {
      const euppConfigureTranslateServiceStub = {
        getTranslateKeyValue(key: string): string {
          return 'translated';
        }
      };
      const actionSpies = jasmine.createSpyObj('SearchCustomerActions', [
        'setSearchResults'
      ]);

      const translateServiceStub = new MockTranslateService();
      const translationKeysStub = {};

      const searchModel = {
        key: null,
        by: { value: 'id', disabled: true },
        customer: '',
        consentChecked: false,
        houseNumber: null
      };

      TestBed.configureTestingModule({
        declarations: [SearchCustomerComponent],
        imports: [
          ReactiveFormsModule,
          HttpClientModule,
          BrowserModule,
          NgReduxModule,
          NgReduxTestingModule,
          SharedModule,
          TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: createTranslateLoader,
              deps: [HttpClient]
            }
          })
        ],
        providers: [
          { provide: TranslationKeys, useValue: translationKeysStub },
          { provide: TranslateService, useValue: translateServiceStub },
          { provide: EuppConfigureTranslateService, useValue: euppConfigureTranslateServiceStub },
          FormBuilder,
          SearchCustomerActions
        ]
      }).compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(SearchCustomerComponent);
          component = fixture.componentInstance;
          component.searchForm = new FormGroup({
            'key': new FormControl(searchModel.key),
            'by': new FormControl(searchModel.by),
            'customer': new FormControl(searchModel.customer),
            'houseNumber': new FormControl(searchModel.houseNumber),
            'consentChecked': new FormControl(searchModel.consentChecked)
          });
          component.searchForm.patchValue({ by: 'id' });
          // Redux clean up
          MockNgRedux.reset();
          MockNgRedux.getSelectorStub((state: IRootState) => state.appReducer.locale)
            .next('se');
          MockNgRedux.getSelectorStub((state: IRootState) => state.appReducer.site)
            .next('se');
          MockNgRedux.getSelectorStub((state: IRootState) => state.searchCustomerReducer)
            .next({
              searchKey: '',
              searchType: 'id',
              searchResult: [],
              showSelectCustomerTooltip: false,
              consentSelected: false,
              showConsentToolTip: false,
              loadingState: SearchLoadingState.loading
            });
          MockNgRedux.getSelectorStub((state: IRootState) => state.appReducer.accountData)
            .next({
              id: String(),
              name: String(),
              upn: String()
            });
          MockNgRedux.getSelectorStub((state: IRootState) =>
            state.searchCustomerReducer.loadingState)
            .next(SearchLoadingState.complete);
          // mock for the cosent tooltip
          MockNgRedux.getSelectorStub((state: IRootState) =>
            state.searchCustomerReducer.consentSelected)
            .next(false);
          MockNgRedux.getSelectorStub((state: IRootState) =>
            state.searchCustomerReducer.showConsentToolTip).next(false);
          fixture.detectChanges();
        });
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have locale se', () => {
    component.locale$.subscribe(locale => {
      expect(component.locale).toEqual('se');
    });
  });

  using(['12345678', '12345678901'], function (COC) {
    it('should render the form invalid if the COC number is invalid', function () {
      // act
      component.searchForm.patchValue({ key: COC });

      // assert
      component.searchKey$.subscribe(key => {
        expect(component.searchForm.valid).toBe(false);
      });
    });
  });

  using(['1234567890', '123456789012', '123456-7890 ', '12345678-9012'], function (COC) {
    it('should render the form valid if the COC number is valid', function () {
      // act
      component.searchForm.patchValue({ key: COC });

      // assert
      component.searchKey$.subscribe(key => {
        expect(component.searchForm.valid).toBe(true);
      });
    });
  });

  it('should return a validation rule if the COC number is invalid', () => {
    // act
    component.searchForm.patchValue({ key: '12345678' });

    // assert
    component.searchKey$.subscribe(key => {
      expect(component.key.errors.inputLength).toBeTruthy();
      expect(component.key.errors.inputLength).toContain('10');
      expect(component.key.errors.inputLength).toContain('12');
    });
  });

  it('should display a warning message if the entered COC is invalid', function () {
    // arrange
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const searchInput: HTMLInputElement = compiled.querySelector('.search-input input');

    // act
    component.searchForm.patchValue({ key: '12345678901' });
    searchInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    // assert
    component.searchKey$.subscribe(key => {
      expect(compiled.querySelector('.validation')).toBeTruthy();
    });
  });
  it('should display a warning message if the entered Post Code is invalid', function () {
    // arrange
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const searchInput: HTMLInputElement = compiled.querySelector('.search-input input');
    component.searchForm.patchValue({ by: 'postalCode' });
    component.searchForm.patchValue({ houseNumber: '1234' });
    // act
    component.searchForm.patchValue({ key: '1067' });
    searchInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    // assert
    component.searchKey$.subscribe(key => {
      expect(compiled.querySelector('.validation')).toBeTruthy();
    });
  });
  using(['1034LH', '5089LH', '5089LH ', '5643MT'], function (postalCode) {
    it('Check the valid postcode', function () {
      // act
      component.searchForm.patchValue({ by: 'postalCode' });
      component.searchForm.patchValue({ key: postalCode });

      // assert
      component.searchKey$.subscribe(key => {
        expect(component.searchForm.valid).toBe(true);
      });
    });
  });
});
