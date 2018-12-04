import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChildren,
  Input,
  ViewChild,
  HostListener,
  AfterViewChecked
} from '@angular/core';
import { select, select$ } from '@angular-redux/store';

import { Subscription } from 'rxjs/Subscription';
import {
  FormGroup,
  FormControl,
  FormArray,
  FormControlName,
  FormBuilder,
  AbstractControl
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { CurrencyService } from '../core/account/currency.service';
import { last } from 'lodash';
import {
  EuppConfigureTranslateService
} from '../shared/translation/eupp-configure-translate.service';
import { TranslationKeys } from '../shared/translation/translation-keys';
import { TranslateService } from '@ngx-translate/core';
import { StringConstants } from '../shared/string-constants';
import { SimpleAssetActions } from './simple-asset.actions';
import { Asset, IBrandModel, IAssetType } from './simple-asset';
import {
  FormatCurrencyDirective
} from '../shared/directives/format-currency.directive';
import { isNil } from 'lodash';
import { ApiMasterAssetTypes } from '../core/account/interfaces/api-master-asset';
import {
  getFormArrayFromObj,
  canLoadData
} from './simple-asset.transformers';
import { RoutesWorkflowService } from '../shared/routes/routes-workflow.service';
import { IRootState } from '../store/root.state';
import { TooltipDisplay } from '../shared/tooltip/tooltip-display';
import { FeatureToggleService } from '../core/feature-toggle/feature-toggle.service';
import { TooltipPositionHelper } from '../shared/tooltip/tooltip-position.helper';
import { setBubbleProperties, shouldHandleIconEvent } from '../shared/tooltip/tooltip-helpers';
import { tooltipAnimation } from '../shared/tooltip/tooltip-animation';

@Component({
  selector: 'app-simple-asset',
  templateUrl: './simple-asset.component.html',
  styleUrls: ['./simple-asset.component.scss'],
  animations: [tooltipAnimation]
})
export class SimpleAssetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChildren(FormatCurrencyDirective)
  formatCurrency: FormatCurrencyDirective;
  @ViewChild('assetFormRow') assetFormRow: ElementRef;
  @select((state: IRootState) => state.simpleAssetsReducer.totalAssetAmount)
  totalAssetAmount$: Observable<number>;
  @select$((state: IRootState) => state, getFormArrayFromObj)
  assetFormArray$: Observable<FormArray>;
  @select(['simpleAssetsReducer', 'brandModels'])
  brandModels$: Observable<IBrandModel[]>;
  @select((state: IRootState) => state.simpleAssetsReducer.assetTypes)
  assetTypes$: Observable<IAssetType[]>;
  @select((state: IRootState) => state.appReducer.selectedFinancialProduct)
  selectedFinancialProduct$: Observable<string>;
  @select((state: IRootState) => state.simpleAssetsReducer.fieldSetup)
  fieldSetup$: Observable<string>;
  @select((state: IRootState) => state.simpleAssetsReducer.resetForm)
  resetForm$: Observable<string>;
  @select$(['appReducer', 'accountData'], canLoadData)
  isRequiredDataLoaded$: Observable<string[]>;
  // get currency symbol position
  @select((state: IRootState) => state.appReducer.currencySymbolPosition)
  currencySymbolPosition$: Observable<string>;
  @select((state: IRootState) => state.appReducer.selectedBrandModel)
  selectedBrandModel$: Observable<ApiMasterAssetTypes.IBrand>;
  @select((state: IRootState) => state.simpleAssetsReducer.loadingState)
  loadingState$: Observable<string>;
  @select((state: IRootState) => state.simpleAssetsReducer.assetConditionAccepted)
  assetConditionAccepted$: Observable<boolean>;
  @select((state: IRootState) => state.appReducer.site)
  site$: Observable<string>;
  @select((state: IRootState) => state.appReducer.displayMaintenance)
  withMaintenance$: Observable<boolean>;
  @select((state: IRootState) => state.simpleAssetsReducer.displayLockedBubble)
  showLockedBubble$: Observable<boolean>;
  showQuantityBubble: boolean;
  showUnitPriceBubble: boolean;
  showMaximumNumberRowBubble: boolean;
  quantityInputBubbleDetails =
    new TooltipDisplay(true, false, { top: '35px', left: '5px' }, { top: true, left: true }, 30);
  amountInputBubbleDetails =
    new TooltipDisplay(true, false, { top: '35px', left: '5px' }, { top: true, left: true }, 30);
  maximumRowBubbleDetails =
    new TooltipDisplay(true, false, { bottom: '-40px', left: '40px' }, { top: true, left: true });
  lockBubbleDisplay = new TooltipDisplay(true, true,
    { top: '35px' }, { top: true });

  @ViewChildren(FormControlName, { read: ElementRef })
  formInputElements: ElementRef[];
  @Input()
  simpleAssetForm: FormGroup;
  filteredAssetByFinancialProductId: string[];
  currencySymbol: string;
  errorInput: boolean;
  errorMessage: string;
  defaultUnitPriceWholeAmount: string;
  defaultUnitPriceCentAmount: string;
  unitPriceWholeAmount: string;
  quantityValue: number;
  showCompletePreviousError: boolean;
  showMaxRowsReached: boolean;
  showMaxAssetsReached: boolean;
  decimalSeparator: string;
  amountPlaceholder: string;
  minNrOfAssets = 1;
  maxNrOfAssets = 99;
  maxRows = 99;
  quantityMaxLength = 2;
  fieldSetup: string;
  buildingYears: Array<string> = new Array<string>();
  previousSelectedFinancialProduct = '';
  dataLoaded = false;
  bubbleIndex: number;
  assetTypes: IAssetType[] = [];
  lockElID: string;

  private _subscriptions = new Subscription();

  get nlSetup(): boolean {
    return this.fieldSetup === StringConstants.fieldSetup.nlSetup;
  }

  get nordicSetup(): boolean {
    return this.fieldSetup === StringConstants.fieldSetup.nordicSetup;
  }

  get assetFormArray(): FormArray {
    return (this.simpleAssetForm.get('assetFormArray') as FormArray);
  }

  get arePreviousValid(): boolean {
    return this.assetFormArray.controls.every((row) => row.valid);
  }

  get canAddAssets(): boolean {
    let count = 0;
    this.assetFormArray.value.forEach((val, i) => {
      if (val.quantity) {
        count += parseInt(val.quantity, 10);
      }
    });
    return count < this.maxNrOfAssets;
  }

  get placeholderQuantity() {
    return `${this.minNrOfAssets}-${this.maxNrOfAssets}`;
  }

  get supports999Assets() {
    return this.nordicSetup && this._featureToggle.canSubmitMoreThan99Assets();
  }

  constructor(
    public _el: ElementRef,
    private _formBuilder: FormBuilder,
    private _currencyService: CurrencyService,
    private _translationKeys: TranslationKeys,
    private _simpleAssetActions: SimpleAssetActions,
    // required for translate pipe to work correctly
    private _euppConfigureTranslateService: EuppConfigureTranslateService,
    private _translateService: TranslateService,
    private _stepLogic: RoutesWorkflowService,
    private _featureToggle: FeatureToggleService
  ) { }

  ngOnInit() {
    if (isNil(this.simpleAssetForm)) {
      this.simpleAssetForm = this._formBuilder.group({
        assetFormArray: []
      });
    }
    this.populateBuildingYear();
    this.loadingInitialData();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private subscribeToAssetFormArray(): void {
    this._subscriptions.add(
      this.assetFormArray$.subscribe(assetFormArray => {
        if (isNil(assetFormArray)) {
          return;
        }

        if (this.assetFormArray === null ||
          this.assetFormArray.length !== assetFormArray.length ||
          this.ensureDefaultAssetType(assetFormArray)) {
          this.simpleAssetForm.controls.assetFormArray = assetFormArray;
        }
      })
    );
  }

  private ensureDefaultAssetType(assetFormArray: FormArray) {
    const assetControls = assetFormArray.controls[0];
    if (this.nordicSetup && assetFormArray && assetControls &&
      !isNil(assetControls.get('quantity')) && assetControls.get('quantity').value === '' &&
      !isNil(assetControls.get('description')) && assetControls.get('description').value === '' &&
      !isNil(assetControls.get('unitPrice')) && assetControls.get('unitPrice').value === '' &&
      !isNil(assetControls.get('assetType')) &&
      assetControls.get('assetType').value !== this.assetTypes[0].name) {
      return true;
    }
    return false;
  }

  private ensureAssetType() {
    if (this.nordicSetup) {
      this._subscriptions.add(this.assetTypes$.subscribe(assetTypes => {
        this.assetTypes = assetTypes;
      }));
    }
  }

  private subscribeToFieldSetup(): void {
    this._subscriptions.add(
      this.fieldSetup$.subscribe((setup: string) => {
        this.fieldSetup = setup;

        // the location of this check and action may change
        if (this.nlSetup) {
          // if nlSetup, fetch the brandModels
          this._simpleAssetActions.getBrandModels();
          this.maxNrOfAssets = 99;
          this.quantityMaxLength = 2;
        } else if (this.nordicSetup && this._featureToggle.canSubmitMoreThan99Assets()) {
          this.maxNrOfAssets = 999;
          this.quantityMaxLength = 3;
        }
      })
    );
  }

  private populateBuildingYear(): void {
    let i;
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 10;
    for (i = currentYear + 1; i >= minYear; i--) {
      this.buildingYears.push(i);
    }
  }

  /**
  * Subscribing to initial data, and filtering by first emitted item of criteria,
  * additionally takes an optional predicate function and sets the error state.
  * The subscription is disposed immediately when the observable stream ends.
  */
  private loadingInitialData(): void {
    this._subscriptions.add(
      this.isRequiredDataLoaded$.subscribe((isRequiredDataLoaded) => {
        if (isRequiredDataLoaded) {
          this.dataLoaded = true;
          this.onInitCompleted(this.dataLoaded);
        }
        // todo: handle if required data not loaded
      })
    );
  }

  private onInitCompleted(completed: boolean) {
    if (completed === true) {
      this.subscribeToFieldSetup();

      // after loading initialise form values
      this.initializeFormValues();

      this.subscribeToAssetFormArray();

      this.initLockedStepListener();

      this.ensureAssetType();
    }
  }

  private initLockedStepListener() {
    this._subscriptions.add(
      this._stepLogic.step$.subscribe(steps => {
        if (steps[0] && steps[0].locked) {
          this.simpleAssetForm.disable();
        }
      })
    );
  }

  private setPlaceHolder(): void {
    this.amountPlaceholder = this._currencyService.numberToDecimalString(0);
  }

  rowChanged(index: number): void {
    const asset: Asset = this.getAssetFromFormArray(index);
    const rowControls = this.assetFormArray.controls;
    this.validateMaxRows(rowControls, index);

    if (this.nordicSetup && !this.showMaxAssetsReached) {
      this._simpleAssetActions.updateAsset(index, asset);
    } else if (this.nlSetup) {
      // see if 99 assets pass
      if (!this.showMaxAssetsReached) {
        // If there is a brand model then trigger the calculation action
        if (rowControls[index].get('brandModel').value) {
          this._simpleAssetActions.updateAsset(index, asset);
        } else {
          this._simpleAssetActions.clearBrandModel(index);
        }
      }
    }
  }


  isMaxAssetCountReached(controls: AbstractControl[], index: number): boolean {
    let count = 0;
    this.assetFormArray.value.forEach((val, i) => {
      if (val.quantity && i !== index) {
        count += parseInt(val.quantity, 10);
      }
    });
    const currentValue = controls[index] && controls[index].get('quantity').value || null;
    if (currentValue) {
      return (parseInt(currentValue, 10) + count) > this.maxNrOfAssets;
    }
    return false;
  }

  private validateMaxRows(rowControls: AbstractControl[], index: number) {
    if (this.isMaxAssetCountReached(rowControls, index)) {
      this.showMaxAssetsReached = true;
      this.assetFormArray.setErrors({ 'maxAsset': this.maxNrOfAssets });
    } else {
      this.showMaxAssetsReached = false;
      this.assetFormArray.setErrors(null);
    }
  }

  private getAssetFromFormArray(index: number): Asset {
    const rowControls = this.assetFormArray.controls;
    const quantity: number = parseInt(rowControls[index].get('quantity').value, 10) || 0;
    const txtUnitPrice = rowControls[index].get('unitPrice').value || 0;
    const unitPrice: number = this._currencyService.decimalStringToNumber(`${txtUnitPrice}`);
    const totalAmount: number = quantity * unitPrice;
    let id: string = null;
    let assetType: string = null;
    if (!isNil(rowControls[index].get('assetType'))) {
      assetType = rowControls[index].get('assetType').value;
      id = assetType;
    }
    let description: string = null;
    if (!isNil(rowControls[index].get('description'))) {
      description = rowControls[index].get('description').value;
    }
    let buildingYear: string = null;
    if (!isNil(rowControls[index].get('year'))) {
      buildingYear = rowControls[index].get('year').value;
    }
    let brandModel: string = null;
    if (!isNil(rowControls[index].get('brandModel'))) {
      brandModel = rowControls[index].get('brandModel').value;
      id = brandModel;
    }

    /**
    * Note reactive form doesnt return an text of the selected option.
    * So best way is to handle nativeway and read the selected text
    */
    let modelName: string = null;
    if (!isNil(rowControls[index].get('brandModel'))) {
      const brandModelSelect =
        this.assetFormRow.nativeElement.querySelector('#assetBrandModel_' + (index + 1) + ' input');
      modelName = brandModelSelect.value;
    }

    let brandName: string = null;
    if (!isNil(rowControls[index].get('brandName'))) {
      brandName = rowControls[index].get('brandName').value;
    }
    const asset: Asset =
      new Asset(
        id,
        quantity,
        unitPrice,
        totalAmount,
        assetType,
        brandModel,
        buildingYear,
        description, modelName,
        brandName);
    return asset;

  }

  private isAssetValid(asset: Asset): boolean {
    return !isNaN(asset.quantity) && !isNaN(asset.unitPrice);
  }

  private initializeFormValues(): void {
    // Call currency serive to get the decimal separator based on the locale
    this.decimalSeparator = this._currencyService.getDecimalSeparator();
    this.setPlaceHolder();
    this.currencySymbol = this._currencyService.getCurrencySymbol();
  }

  addAsset(): void {
    if (this.simpleAssetForm.disabled) {
      return;
    }
    if (!this.isRowError()) {
      this.setDefaultAssetSelection();
      this._simpleAssetActions.addAsset();
    }
  }

  private isRowError(): boolean {
    this.clearRowErrors();
    if (this.assetFormArray.length >= this.maxRows) {
      this.showMaxRowsReached = true;
      return true;
    }
    if (!this.arePreviousValid) {
      this.showCompletePreviousError = true;
      return true;
    }

    let count = 0;
    this.assetFormArray.value.forEach((val) => {
      if (val.quantity) {
        count += parseInt(val.quantity, 10);
      }
    });
    if (count >= this.maxNrOfAssets) {
      return this.showMaxAssetsReached = true;
    }

    return false;
  }

  private clearRowErrors(): void {
    this.showCompletePreviousError = false;
    this.showMaxRowsReached = false;
  }

  // set the default selection after adding new row
  private setDefaultAssetSelection(): void {
    // this if condition is to check the form and Financial Products shouldn't be empty
    if (!isNil(this.filteredAssetByFinancialProductId) &&
      this.filteredAssetByFinancialProductId.length > 0 && this.assetFormArray.length > 0) {

      // this.assets.length - 1 last row added should get updated
      this.assetFormArray.at(this.assetFormArray.length - 1).patchValue
        ({ assetType: this.filteredAssetByFinancialProductId[0] }, { emitEvent: false });
    }
  }

  deleteRow(index: number): void {
    this._simpleAssetActions.deleteAsset(index);
    this.validateMaxRows(this.assetFormArray.controls, index);
    this.clearRowErrors();
  }

  isRemoveOrClear(index): boolean {
    return index ? false : true;
  }

  rowHasError(row: FormControl) {
    return row && row.touched && row.errors;
  }

  showHideQuantityBubble(showHide: boolean, index: number) {
    this.showQuantityBubble = showHide;
    this.bubbleIndex = index;
  }

  showHideUnitPriceBubble(showHide: boolean, index: number) {
    this.showUnitPriceBubble = showHide;
    this.bubbleIndex = index;
  }

  showMaximumRowBubble(showHie: boolean) {
    this.showMaximumNumberRowBubble = showHie;
  }

  toggleLockBubble(display: boolean, event?): void {
    if (event) {
      this.lockElID = event.target.tagName === 'SPAN'
        ? event.target.parentElement.id
        : event.target.id;
      TooltipPositionHelper.getLockBubblePosition(this._el, this.lockElID, this.lockBubbleDisplay);
      setBubbleProperties(this.lockBubbleDisplay, event, TooltipPositionHelper.isLowRes);
    }
    if (shouldHandleIconEvent(event)) {
      this._simpleAssetActions.toggleLockBubbleDisplay(display);
    } else {
      this._simpleAssetActions.toggleLockBubbleDisplay(false);
    }
  }

  ngAfterViewChecked(): void {
    if (this.lockElID) {
      TooltipPositionHelper.getLockBubblePosition(this._el, this.lockElID, this.lockBubbleDisplay);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.lockElID) {
      TooltipPositionHelper.getLockBubblePosition(this._el, this.lockElID, this.lockBubbleDisplay);
    }
  }

  assetConsentCheck(target) {
    this._simpleAssetActions.updateAssetCondition(target.checked);
  }
}
