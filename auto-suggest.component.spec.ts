import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormsModule, ReactiveFormsModule,
  FormGroup, FormControl, Validators
} from '@angular/forms';
import { AutoSuggestComponent } from './auto-suggest.component';
import { ClickOutsideDirective } from './drop-down-directive';
import { SearchFilterPipe } from './filter.pipe';
import { LetterBoldPipe } from './letter.bold';
import { ApiMasterAssetTypes } from '../../core/account/interfaces/api-master-asset';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { EuppConfigureTranslateService } from '../translation/eupp-configure-translate.service';
import { RoutesWorkflowService } from '../routes/routes-workflow.service';
import { Observable } from 'rxjs/Observable';
import { SimpleChange } from '@angular/core';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/data/translations/', '.json');
}

describe('AutoSuggestComponent', () => {
  let component: AutoSuggestComponent;
  let fixture: ComponentFixture<AutoSuggestComponent>;

  const modelList: ApiMasterAssetTypes.IModel[] = [
    {
      modelId: 'id1',
      modelName: 'modelA',
      modifiedDate: '',
      listPrice: 1,
      cashflows: [],
      financialProducts: []
    },
    {
      modelId: 'id2',
      modelName: 'modelB',
      modifiedDate: '',
      listPrice: 1,
      cashflows: [],
      financialProducts: []
    }
  ];

  beforeEach(async(() => {
    const euppConfigureTranslateServiceStub = {
      getTranslateKeyValue(key: string): string {
        return 'translated';
      }
    };
    const stepLogicStub = {
      step$: Observable.of([])
    };
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        }),
        FormsModule],
      declarations: [AutoSuggestComponent,
        ClickOutsideDirective,
        SearchFilterPipe,
        LetterBoldPipe],
      providers: [
        SearchFilterPipe,
        { provide: RoutesWorkflowService, useValue: stepLogicStub },
        { provide: EuppConfigureTranslateService, useValue: euppConfigureTranslateServiceStub },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoSuggestComponent);
    component = fixture.componentInstance;
    component.brandModels = modelList;
    component.indexProperty = 'modelId';
    component.searchProperty = 'modelName';
    component.selectedIndex = 0;
    component.showDropDown = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init properly', () => {
    component.stateForm = new FormGroup({
      'search': new FormControl('')
    });
    fixture.detectChanges();
    expect(component.selectedId).toBe('id1');
    expect(component.filteredList).toEqual(modelList);
    expect(component.showDropDown).toBeFalsy();
  });

  it('should update the query when init with value', () => {
    component.stateForm = new FormGroup({
      'search': new FormControl('')
    });
    component.stateForm.controls['search'].setValue('modelA');
    fixture.detectChanges();
    expect(component.query).toBe('modelA');
  });

  it('input should be disabled when only 1 option is available', () => {
    component.stateForm = new FormGroup({
      'search': new FormControl('')
    });
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges({
      brandModels: new SimpleChange(null, modelList.slice(0, 1), false)
    });
    fixture.detectChanges();
    expect(component.stateForm.controls.search.disabled).toBeTruthy();
  });

  it('input should be re-enabled when more than 1 option is available', () => {
    component.stateForm = new FormGroup({
      'search': new FormControl('')
    });
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges({
      brandModels: new SimpleChange(null, modelList.slice(0, 1), false)
    });
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges({
      brandModels: new SimpleChange(modelList.slice(0, 1), modelList, false)
    });
    fixture.detectChanges();
    expect(component.stateForm.controls.search.disabled).toBeFalsy();
  });

  it('should update list on input query', async(() => {
    // arrange
    const searchFor: HTMLInputElement = fixture.nativeElement.querySelector('#autoSuggestSearch');
    const testQuery = 'modelB';

    // act
    searchFor.value = testQuery;
    searchFor.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // assert
    fixture.whenStable().then(() => {
      expect(component.query).toBe(testQuery);
      expect(component.filteredList.length).toBe(1);
      expect(component.filteredList[0].modelId).toBe('id2');
    });
  }));

  it('should open list on click inside input', async(() => {
    // arrange
    const searchFor: HTMLInputElement = fixture.nativeElement.querySelector('#autoSuggestSearch');

    // act
    searchFor.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    // assert
    fixture.whenStable().then(() => {
      expect(component.showDropDown).toBeTruthy();
    });
  }));

  it('should select current on enter inside input', async(() => {
    // arrange
    const searchFor: HTMLInputElement = fixture.nativeElement.querySelector('#autoSuggestSearch');
    component.selectedIndex = 1;

    // act
    searchFor.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    fixture.detectChanges();

    // assert
    fixture.whenStable().then(() => {
      expect(searchFor.value).toBe(modelList[1].modelName);
      expect(component.query).toBe(modelList[1].modelName);
      expect(component.showDropDown).toBeFalsy();
    });
  }));

  it('should open list on first down arrow inside input', async(() => {
    // arrange
    const searchFor: HTMLInputElement = fixture.nativeElement.querySelector('#autoSuggestSearch');

    // act
    searchFor.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
    fixture.detectChanges();

    // assert
    fixture.whenStable().then(() => {
      expect(component.showDropDown).toBeTruthy();
    });
  }));

  it('should navigate an open list on down arrow inside input', async(() => {
    // arrange
    const searchFor: HTMLInputElement = fixture.nativeElement.querySelector('#autoSuggestSearch');
    component.showDropDown = true;
    fixture.detectChanges();

    // act
    searchFor.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
    fixture.detectChanges();

    // assert
    fixture.whenStable().then(() => {
      expect(component.selectedIndex).toBe(1);
    });
  }));

  it('should navigate an open list on up arrow inside input', async(() => {
    // arrange
    const searchFor: HTMLInputElement = fixture.nativeElement.querySelector('#autoSuggestSearch');
    component.showDropDown = true;
    component.selectedIndex = 1;
    fixture.detectChanges();

    // act
    searchFor.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
    fixture.detectChanges();

    // assert
    fixture.whenStable().then(() => {
      expect(component.selectedIndex).toBe(0);
    });
  }));

  it('should validate input field as required', async(() => {
    component.stateForm = new FormGroup({
      'search': new FormControl(null, [Validators.required])
    });
    component.stateForm.markAsTouched();
    expect(component.stateForm.valid).toBeFalsy();
    component.stateForm.controls['search'].setValue('model');
    fixture.detectChanges();
    expect(component.stateForm.valid).toBeTruthy();
  }));
});
