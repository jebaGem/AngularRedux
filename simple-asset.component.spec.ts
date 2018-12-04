import {
  ComponentFixture,
  TestBed,
  async,
} from '@angular/core/testing';
import { SimpleAssetComponent } from './simple-asset.component';
import {
  ReactiveFormsModule, FormsModule
} from '@angular/forms';
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
import {
  EuppConfigureTranslateService
} from '../shared/translation/eupp-configure-translate.service';
import { CurrencyService } from '../core/account/currency.service';
import { SimpleAssetActions } from './simple-asset.actions';
import { CurrencySymbolPosition } from '../core/account/currency-symbol-position';
import { MockTranslateService } from '../shared/mocks/translate-service.mock';
import { SharedModule } from '../shared/shared.module';
import { Asset, ISimpleAssetState, IBrandModel, IAssetType } from './simple-asset';
import { ApiFinancialProductList } from '../core/account/interfaces/api-financial-product-list';
import { StringConstants } from '../shared/string-constants';
import { NgReduxModule } from '@angular-redux/store';
import { RoutesWorkflowService } from '../shared/routes/routes-workflow.service';
import { Observable } from 'rxjs/Observable';
import { ApiAccountData } from '../core/account/interfaces/api-account';
import { FeatureToggleService } from '../core/feature-toggle/feature-toggle.service';
import { IRootState } from '../store/root.state';
import { StepContext } from '../store';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/data/translations/', '.json');
}

// This is what the Asset class looks like (for reference)
// export class Asset {
//   constructor(
//     public quantity: number,
//     public unitPrice: number,
//     public totalAmount: number,
//     public assetType?: string,
//     public brandModel?: string,
//     public year?: string,
//     public description?: string,
//   ) { }
// }

let featureToggleServiceStub: any;
const dummyAssetNordics = {
  quantity: 3,
  unitPrice: 30.20,
  totalAmount: 30.40,
  assetType: 'asset',
  description: 'test desc',
};

const dummyAssetPartner = {
  quantity: 2,
  unitPrice: 10.20,
  totalAmount: 20.40,
  brandModel: 'brand',
  year: '2017',
};

const selectedFinancialOption: ApiFinancialProductList.IFinancialProduct = {
  id: 'ENTR3598B2F69F28B9AFC12581AD002F3F36',
  name: 'Rental',
  modifiedDate: '2018-02-23',
  calculationValidity: 184,
  vatPercentage: 25,
  contractType: 'financial-lease'
};

const initialAssetsNordics: Asset[] = [
  {
    id: '109006;10903674;10974035',
    quantity: 0,
    unitPrice: 0,
    totalAmount: 0,
    assetType: 'Datautrustning',
    description: '',
  }
];

const initialAssetsPartner: Asset[] = [
  {
    id: '109006;10903674;10974035',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    brandModel: 'Model 1',
    year: '2018',
  }
];

const assetTypes: IAssetType[] = [
  {
    name: 'assetType1'
  },
  {
    name: 'assetType2'
  }
];

const brandModels: IBrandModel[] = [
  {
    modelId: '1',
    modelName: 'model1'
  },
  {
    modelId: '2',
    modelName: 'model2'
  }
];

const simpleAssetStatePartner: ISimpleAssetState = {
  totalAssetAmount: 0,
  assets: initialAssetsPartner,
  brandModels: brandModels,
  assetTypes: [],
  resetForm: '',
  fieldSetup: StringConstants.fieldSetup.nlSetup,
  loadingState: StringConstants.loadingState.LOADING_COMPLETE
};

const simpleAssetStateNordics: ISimpleAssetState = {
  totalAssetAmount: 0,
  assets: initialAssetsNordics,
  brandModels: [],
  assetTypes: assetTypes,
  resetForm: '',
  fieldSetup: StringConstants.fieldSetup.nordicSetup,
  loadingState: StringConstants.loadingState.LOADING_COMPLETE
};

const simpleAssetStateMock = {
  appReducer: { steps: new StepContext() },
  simpleAssetsReducer: simpleAssetStateNordics
};

const initialAccount: ApiAccountData.IApiAccountData = {
  id: 'dummy_account_id',
  name: 'dummy_account_name',
  programId: 'dummy_program_id',
  upn: 'dummy_upn'
};

const SIMPLE_ASSET_REDUCER = 'simpleAssetsReducer';

describe('SimpleAssetComponent', () => {
  let component: SimpleAssetComponent;
  let fixture: ComponentFixture<SimpleAssetComponent>;

  beforeEach(() => {
    const euppConfigureTranslateServiceStub = {};
    const translateServiceStub = new MockTranslateService();
    const translationKeysStub = {};
    const currencyServiceStub = {
      numberToDecimalString(amount: Number): string {
        return '0,00';
      },
      decimalStringToNumber(amount: Number): string {
        return '0,00';
      },
      getCurrencySymbolPosition(): CurrencySymbolPosition {
        return CurrencySymbolPosition.right;
      },
      getCurrencySymbol(): string {
        return 'Kr';
      },
      getDecimalSeparator(): string {
        return ',';
      },
      stringToDecimalString(value: string, strip?: boolean) {
        return '1 111';
      }
    };

    const stepLogicStub = {
      step$: Observable.of([])
    };

    featureToggleServiceStub = {
      canSubmitMoreThan99Assets: () => true
    };
    const actionSpies = jasmine.createSpyObj('SimpleAssetActions', [
      'updateAssetCondition'
    ]);
    TestBed.configureTestingModule({
      declarations: [SimpleAssetComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        BrowserModule,
        NgReduxModule,
        FormsModule,
        NgReduxTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        }),
        SharedModule
      ],
      providers: [
        { provide: TranslationKeys, useValue: translationKeysStub },
        { provide: TranslateService, useValue: translateServiceStub },
        {
          provide: EuppConfigureTranslateService,
          useValue: euppConfigureTranslateServiceStub
        },
        { provide: CurrencyService, useValue: currencyServiceStub },
        SimpleAssetActions,
        { provide: RoutesWorkflowService, useValue: stepLogicStub },
        { provide: FeatureToggleService, useValue: featureToggleServiceStub },
        { provide: SimpleAssetActions, useValue: actionSpies },
      ]
    });
    fixture = TestBed.createComponent(SimpleAssetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: This test works locally but not in Azure DevOps
  xit('should have a row', () => {
    MockNgRedux.reset();

    MockNgRedux.getSelectorStub(['appReducer', 'accountData'])
      .next(initialAccount);
    MockNgRedux.getSelectorStub([SIMPLE_ASSET_REDUCER, 'loadingState'])
      .next(StringConstants.loadingState.LOADING_COMPLETE);
    MockNgRedux.getSelectorStub([SIMPLE_ASSET_REDUCER, 'fieldSetup'])
      .next(StringConstants.fieldSetup.nordicSetup);
    MockNgRedux.getSelectorStub(['appReducer', 'selectedFinancialProduct'])
      .next(selectedFinancialOption);
    MockNgRedux.getSelectorStub((state) => state)
      .next(simpleAssetStateMock);
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.assetFormArray.controls).toBeDefined();
  });


  it('should listen to updates of the fieldSetup property of SimpleAssetComponent',
    async(() => {
      const fixtureLocal = TestBed.createComponent(SimpleAssetComponent);
      const componentLocal = fixtureLocal.componentInstance;


      MockNgRedux.reset();
      // NOTE! Always send through accountData otherwise the other observables will
      // not trigger
      MockNgRedux.getSelectorStub(['appReducer', 'accountData'])
        .next(initialAccount);
      MockNgRedux.getSelectorStub([SIMPLE_ASSET_REDUCER, 'loadingState'])
        .next(StringConstants.loadingState.LOADING_COMPLETE);
      MockNgRedux.getSelectorStub([SIMPLE_ASSET_REDUCER, 'fieldSetup'])
        .next(StringConstants.fieldSetup.nlSetup);

      fixtureLocal.detectChanges();
      componentLocal.fieldSetup$
        .subscribe(value => {
          expect(value).toEqual(StringConstants.fieldSetup.nlSetup);
          expect(componentLocal.fieldSetup).toEqual(StringConstants.fieldSetup.nlSetup);
        });
    }));

  function initializeTheState(fieldSetup: string, simpleAssetState: ISimpleAssetState) {
    MockNgRedux.reset();
    // NOTE! Always send through accountData otherwise the other observables will
    // not trigger
    MockNgRedux.getSelectorStub(['appReducer', 'accountData'])
      .next(initialAccount);
    MockNgRedux.getSelectorStub([SIMPLE_ASSET_REDUCER, 'loadingState'])
      .next(StringConstants.loadingState.LOADING_COMPLETE);
    MockNgRedux.getSelectorStub([SIMPLE_ASSET_REDUCER, 'fieldSetup'])
      .next(fieldSetup);
    MockNgRedux.getSelectorStub(SIMPLE_ASSET_REDUCER)
      .next(simpleAssetState);
  }

  function testInitialRow(simpleAssetState: ISimpleAssetState, fieldSetup: string) {

    initializeTheState(fieldSetup, simpleAssetState);

    fixture.detectChanges();
    component.assetFormArray$.subscribe(value => {
      expect(value.controls).toBeDefined();
      const assetFormArray = component.assetFormArray;
      expect(assetFormArray.controls).toBeDefined();
      expect(assetFormArray.controls.length).toEqual(1);
      if (fieldSetup === StringConstants.fieldSetup.nordicSetup) {
        expect(assetFormArray.at(0).value.assetType).toEqual('Datautrustning');
        expect(assetFormArray.at(0).value.quantity).toEqual('');
      }
      if (fieldSetup === StringConstants.fieldSetup.nlSetup) {
        expect(assetFormArray.at(0).value.brandModel).toEqual('Model 1');
        expect(assetFormArray.at(0).value.quantity).toEqual(1);
      }
    });
  }

  it('should receive a row (Partner)', async(() => {
    testInitialRow(simpleAssetStatePartner, StringConstants.fieldSetup.nlSetup);
  }));

  it('should receive a row (Nordics)', async(() => {
    testInitialRow(simpleAssetStateNordics, StringConstants.fieldSetup.nordicSetup);
  }));

  function testRowAddWhenPreviousUnfilled(
    simpleAssetState: ISimpleAssetState, fieldSetup: string) {
    const fixtureLocal = TestBed.createComponent(SimpleAssetComponent);
    const componentLocal = fixtureLocal.componentInstance;

    initializeTheState(fieldSetup, simpleAssetState);

    // this HAS to be here
    fixtureLocal.detectChanges();

    componentLocal.assetFormArray$.subscribe(value => {
      expect(value.controls).toBeDefined();
      const assetFormArray = componentLocal.assetFormArray;
      expect(assetFormArray.controls).toBeDefined();
      expect(assetFormArray.controls.length).toEqual(1);
      expect(componentLocal.showCompletePreviousError).toBeFalsy();
      componentLocal.addAsset();
      expect(componentLocal.showCompletePreviousError).toBeTruthy();
      expect(componentLocal.arePreviousValid).toBeFalsy();
    });
  }

  it('should show error if a user tries to add a row when previous unfilled (Partner)',
    async(() => {
      testRowAddWhenPreviousUnfilled(simpleAssetStatePartner,
        StringConstants.fieldSetup.nlSetup);
    }));

  it('should show error if a user tries to add a row when previous unfilled (Nordics)',
    async(() => {
      testRowAddWhenPreviousUnfilled(simpleAssetStateNordics,
        StringConstants.fieldSetup.nordicSetup);
    }));

  function test99Rows(simpleAssetState: ISimpleAssetState, asset: Asset, fieldSetup: string) {
    const fixtureLocal = TestBed.createComponent(SimpleAssetComponent);
    const componentLocal = fixtureLocal.componentInstance;

    // copy the input and assign 99 rows
    const stateWith99Assets = Object.assign({}, simpleAssetState);
    stateWith99Assets.assets = [];

    for (let i = 0; i < 99; i++) {
      stateWith99Assets.assets.push(asset);
    }

    initializeTheState(fieldSetup, stateWith99Assets);

    fixtureLocal.detectChanges();
    componentLocal.assetFormArray$.subscribe(value => {
      expect(value.controls).toBeDefined();
      const assetFormArray = componentLocal.assetFormArray;
      expect(assetFormArray.controls).toBeDefined();
      expect(assetFormArray.controls.length).toEqual(99);
      expect(componentLocal.showMaxRowsReached).toBeFalsy();
      componentLocal.addAsset();
      expect(componentLocal.showMaxRowsReached).toBeTruthy();
    });
  }

  it('should show error if a user tries to add a row when we have 99 already (Partner)',
    async(() => {
      const asset = new Asset('109006;10903674;10974035', 2, 23, 1, '', 'brand', '1999');
      test99Rows(simpleAssetStatePartner, asset, StringConstants.fieldSetup.nlSetup);
    }));

  it('should show error if a user tries to add a row when we have 99 already (Nordics)',
    async(() => {
      const asset = new Asset('109006;10903674;10974035',
        2, 23, 1, 'assetType', '', '1999', 'description');
      test99Rows(simpleAssetStateNordics, asset, StringConstants.fieldSetup.nordicSetup);
    }));

  function test99Assets(simpleAssetState: ISimpleAssetState,
    assetRows: Asset[], fieldSetup: string) {
    const fixtureLocal = TestBed.createComponent(SimpleAssetComponent);
    const componentLocal = fixtureLocal.componentInstance;
    // copy the input and assign 99 rows
    const stateWith99Assets = Object.assign({}, simpleAssetState);
    stateWith99Assets.assets = assetRows;
    initializeTheState(fieldSetup, stateWith99Assets);
    fixtureLocal.detectChanges();
    componentLocal.assetFormArray$.subscribe(value => {
      const assetFormArray = componentLocal.assetFormArray;
      // create fake rowChange() detection
      // because @viewChild return undefined so test would fail
      componentLocal.rowChanged = jasmine.createSpy('rowChanged')
        .and.callFake(() => {
          if (fieldSetup === StringConstants.fieldSetup.nlSetup &&
            componentLocal.isMaxAssetCountReached(value.controls, 1)) {
            componentLocal.showMaxAssetsReached = true;
            componentLocal.assetFormArray.setErrors({ 'maxAsset': componentLocal.maxNrOfAssets });
          } else {
            componentLocal.showMaxAssetsReached = false;
          }
        });
      componentLocal.rowChanged(0);
      expect(value.controls).toBeDefined();
      expect(assetFormArray.controls).toBeDefined();
      fixtureLocal.detectChanges();
      expect(componentLocal.assetFormArray.valid)
        .toBe(fieldSetup !== StringConstants.fieldSetup.nlSetup);
      expect(componentLocal.showMaxAssetsReached)
        .toBe(fieldSetup === StringConstants.fieldSetup.nlSetup);
    });
  }

  it('should show error if a user tries to add 99+ assets (Partner)',
    async(() => {
      const assets = [
        new Asset('109006;10903674;10974035', 99, 23, 1, '', 'brand', '1999'),
        new Asset('109006;10903674;10974011', 1, 23, 1, '', 'brand', '1999'),
      ];
      test99Assets(simpleAssetStatePartner, assets, StringConstants.fieldSetup.nlSetup);
    }));

  it('should not show error if a user tries to add 99+ assets (Nordics)',
    async(() => {
      const assets = [
        new Asset('109006;10903674;10974035',
          99, 23, 1, 'assetType', '', '1999', 'description'),
        new Asset('109006;10903674;10974011',
          2, 23, 1, 'assetType', '', '1999', 'description')];
      test99Assets(simpleAssetStateNordics, assets, StringConstants.fieldSetup.nordicSetup);
    }));

  it('should update the assetConditionAccepted to true if the check box is checked',
    async(() => {
      // arrange
      fixture.detectChanges();
      const actionSpies = TestBed.get(SimpleAssetActions);

      const compiled = fixture.nativeElement;
      const checkBOxCondition: HTMLInputElement = compiled.querySelector('#ciscoAgreeBox');
      component.loadingState$.subscribe(() => {
        checkBOxCondition.dispatchEvent(new Event('click'));
        expect(actionSpies.updateAssetCondition)
          .toHaveBeenCalledWith(true);
      });

    }));
});
