import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  Input,
  ElementRef
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { select, select$ } from '@angular-redux/store';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';
import {
  EuppConfigureTranslateService
} from '../shared/translation/eupp-configure-translate.service';
import { TranslationKeys } from '../shared/translation/translation-keys';
import { SearchCustomerActions } from './search-customer.actions';
import { SearchLoadingState, ISearchCustomerState } from './search-customer.state';
import { CustomerResult } from '../core/account/interfaces/api-customer';
import { StringConstants } from '../shared/string-constants';
import {
  FormatOrganizationIdDirective
} from '../shared/directives/format-organization-id.directive';
import { TooltipDisplay, TooltipInfoIconIds } from '../shared/tooltip/tooltip-display';
import { tooltipAnimation } from '../shared/tooltip/tooltip-animation';
import { IRootState } from '../store/root.state';
import { ApiAccountData } from '../core/account/interfaces/api-account';
import { Step } from '../shared/routes/step';
import { setBubbleProperties, shouldHandleIconEvent } from '../shared/tooltip/tooltip-helpers';
import { TooltipPositionHelper } from '../shared/tooltip/tooltip-position.helper';

const loading = StringConstants.loadingState;

@Component({
  selector: 'app-search-customer',
  templateUrl: './search-customer.component.html',
  styleUrls: ['./search-customer.component.scss'],
  animations: [tooltipAnimation]
})
export class SearchCustomerComponent implements OnInit, OnDestroy {
  @ViewChild(FormatOrganizationIdDirective) formatOrgId: FormatOrganizationIdDirective;

  @select((state: IRootState) => state.appReducer.accountData)
  account$: Observable<ApiAccountData.IApiAccountData>;
  @select((state: IRootState) => state.appReducer.locale)
  locale$: Observable<string>;
  @select((state: IRootState) => state.appReducer.site)
  site$: Observable<string>;
  @select((state: IRootState) => state.searchCustomerReducer)
  initData$: Observable<ISearchCustomerState>;
  @select((state: IRootState) => state.searchCustomerReducer.searchResult)
  searchResult$: Observable<any>;
  @select((state: IRootState) => state.searchCustomerReducer.searchType)
  searchType$: Observable<string>;
  @select((state: IRootState) => state.searchCustomerReducer.searchKey)
  searchKey$: Observable<string>;
  @select((state: IRootState) => state.searchCustomerReducer.showSelectCustomerTooltip)
  showCustomerTooltip$: Observable<boolean>;
  @select((state: IRootState) => state.searchCustomerReducer.showConsentToolTip)
  showConsentToolTip$: Observable<boolean>;
  @select((state: IRootState) => state.searchCustomerReducer.consentSelected)
  consentSelected$: Observable<boolean>;
  @select((state: IRootState) => state.searchCustomerReducer.loadingState)
  loadingState$: Observable<SearchLoadingState>;
  @select((state: IRootState) => state.appReducer.contractData.selectedCustomer)
  selectedCustomer$: Observable<CustomerResult.ISearchCustomerResult>;
  @select((state: IRootState) => state.routesReducer.steps[1].locked)
  stepLocked$: Observable<boolean>;
  @select((state: IRootState) => state.appReducer.steps.active)
  readonly activeStep$: Observable<Step.IStep>;
  @select((state: IRootState) => state.searchCustomerReducer.displayLockedBubble)
  showLockedBubble$: Observable<boolean>;

  @Input()
  searchForm: FormGroup;
  locale: string;
  customerId: string;
  customerName: string;
  results: CustomerResult.ISearchCustomerResult[];
  customerApprovalRequired: boolean;
  fieldSetup: string;
  showAgreementMessageFlag = false;
  isLocked: boolean;
  visibleCustomers = 150;
  searchPlaceholder = StringConstants.searchCustomerPlaceholders.id;
  searchBy = StringConstants.searchByKeys.id;
  lockElID: string;

  selectConsentTooltipProps = new TooltipDisplay(true, true,
    { bottom: '-74px', left: '45px' }, { top: true });
  showAgreementTooltipProps = new TooltipDisplay(true, true,
    { top: '67px', left: '288px' }, { top: true });
  lockBubbleDisplay = new TooltipDisplay(true, true,
    { top: '35px' }, { top: true });

  private _subscriptions = new Subscription();
  private ISearchModel: CustomerResult.ISearchCustomerInput;

  get key() { return this.searchForm.get('key'); }
  get by() { return this.searchForm.get('by'); }
  get houseNumber() { return this.searchForm.get('houseNumber'); }
  get seachByAddress() { return this.by.value === StringConstants.searchByKeys.postalCode; }
  get showValidation() {
    return !this.searchForm.valid && (
      (this.key.touched && !!this.key.errors) ||
      (this.houseNumber.touched && !!this.houseNumber.errors));
  }

  get nlSetup() {
    return this.fieldSetup === StringConstants.siteName.NL;
  }

  get nordicSetup() {
    return this.fieldSetup === StringConstants.siteName.SE;
  }

  constructor(
    public _el: ElementRef,
    private translationKeys: TranslationKeys,
    private euppConfigureTranslateService: EuppConfigureTranslateService,
    private translateService: TranslateService,
    private searchCustomerActions: SearchCustomerActions
  ) { }
  ngOnInit(): void {
    this.loadingInitialData();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  performSearch() {

    this.searchForm.controls.key.markAsTouched({ onlySelf: false });
    this.searchForm.controls.key
      .updateValueAndValidity({ onlySelf: false, emitEvent: true });

    if (this.key && this.key.valid && this.houseNumber.valid) {
      // When performing search clear the already selected customer
      this.searchCustomerActions.clearSelectedCustomer();
      this.setLoading(loading.SEARCH_IN_PROGRESS);
      this.searchCustomerActions.performSearch(this.setAddressKey());
    }
  }

  private initializeSearchForm(initState: ISearchCustomerState): void {
    const { searchType, searchKey, customerId, consentSelected } = initState;
    this.searchBy = searchType ? searchType : StringConstants.searchByKeys.id;

    this.ISearchModel = {
      key: searchKey ? searchKey : null,
      houseNumber: '',
      by: {
        value: this.searchBy,
        disabled: false
      },
      customer: customerId ? customerId : '',
      consentChecked: consentSelected,
    };
    // For Nordics make the select dropdown disable
    if (this.nordicSetup) {
      this.ISearchModel.by.disabled = true;
    }
    if (!this.searchForm) {
      this.searchForm = new FormGroup({});
    }

    this.searchForm.controls = {
      'key': new FormControl(this.ISearchModel.key),
      'by': new FormControl(this.ISearchModel.by),
      'houseNumber': new FormControl(this.ISearchModel.houseNumber),
      'customer': new FormControl(this.ISearchModel.customer),
      'consentChecked': new FormControl(this.ISearchModel.consentChecked)
    };

    this.initLockedStepListener();

    this.by.valueChanges.subscribe((option: string) => {
      this.updateSearchQueryPlaceholder(option);
      this.updateSearchQueryValidator(option);
    }
    );

    this.searchForm.controls.consentChecked.valueChanges.subscribe((checked) => {
      if (this.nlSetup && this.results !== null) {
        this.searchCustomerActions.selectConsentBox(checked);
        this.searchCustomerActions.setCustomerConsentTooltipDisplay(false);
      }
    });

    this.key.valueChanges.subscribe(key => this.searchCustomerActions.setSearchKey(key));

    this.searchType$.subscribe(by => {
      if (by) {
        this.updateSearchQueryPlaceholder(by);
        this.updateSearchQueryValidator(by);
      }

      if (this.searchBy !== by) {
        this.searchBy = by;
        this.resetFormValues();
        this.by.setValue(by, { emitEvent: false });
      }
    });

    // set the initial validator, defined by the default option in ISearchModel
    this.updateSearchQueryValidator(this.ISearchModel.by.value);
    // Disable for Nordics, but enable later depending on locale for NL
    this.customerApprovalRequired = false;
  }

  private updateSearchQueryPlaceholder(option: string) {
    this.searchPlaceholder =
      StringConstants.searchCustomerPlaceholders[option] || this.searchPlaceholder;
  }

  private updateSearchQueryValidator(option: string) {
    this.updateValidators(option);
    this.searchForm.controls.key.updateValueAndValidity();
    this.searchCustomerActions.setSearchType(option);
  }

  private setAddressKey() {
    if (this.seachByAddress) {
      const postalCode = this.key.value;
      const address = this.houseNumber.value || '';
      return `${postalCode} ${address}`;
    }
    return this.key.value;
  }

  /**
   * Managing subscriptions with subs memory pool,
   * instead of unsubscribing declaratively with takeUntil().
   * @returns void
   */
  private initSubscriptions(): void {
    // Update searchKey without emitting valueChange
    this._subscriptions.add(this.searchKey$.subscribe(
      key => this.searchForm.patchValue({ key }, { emitEvent: false })
    ));
    // Update selected customer with emitting valueChange
    this._subscriptions.add(this.selectedCustomer$.subscribe(selected => {
      const customerId = selected ? selected.id : null;
      const customerName = selected ? selected.name : null;
      if (customerId || customerName) {
        // if this is the first customerID set, "harc clear" tooltip
        if (!this.customerId) {
          this.searchCustomerActions.setCustomerTooltipDisplay(false);
        }
        this.customerId = customerId;
        this.customerName = customerName;
        this.searchForm.patchValue({
          'customer': customerId
        }, { emitEvent: true });
      }
    }));

    this._subscriptions.add(this.searchResult$
      .subscribe((results: CustomerResult.ISearchCustomerResult[]) => {
        if (!!results) {
          this.results = results.map((customer) => {
            return {
              ...customer,
              streetAddress: `${customer.address.street} ${customer.address.houseNumber}`
            };
          });
          if (!this.isLocked) {
            this.searchForm.enable();
            this.searchForm.controls.by.setValidators(Validators.nullValidator);
          }
        } else if (results === null) {
          this.results = results;
        }
        this.setLoading(loading.LOADING_COMPLETE);
      }, error => this.setLoading(loading.SEARCH_ERROR)));

    this._subscriptions.add(this.consentSelected$.subscribe(checked => {
      this.searchForm.patchValue({
        'consentChecked': checked
      }, { emitEvent: true });
    }));
  }

  private initLockedStepListener() {
    this._subscriptions.add(
      this.stepLocked$.subscribe(locked => {
        if (locked) {
          this.isLocked = locked;
          this.searchForm.disable();
        }
      })
    );
  }

  /**
   * Subscribing to initial data, and filtering by first emitted item of criteria,
   * additionally takes an optional predicate function and sets the error state.
   * The subscription is disposed immediately when the observable stream ends.
   */
  private loadingInitialData(): void {
    // ...first().subscribe() breaks when navigating from load application By ID
    Observable.zip(this.account$, this.locale$, this.initData$,
      (account: string[], locale: string, state: ISearchCustomerState) =>
        ({ account, locale, state })).subscribe(
          bundle => {
            const loadingState = (bundle && bundle.account)
              ? SearchLoadingState.complete : SearchLoadingState.loading;
            this.locale = bundle.locale;
            this.searchCustomerActions.setLoadingState(loadingState);
            this.onInitCompleted(loadingState === SearchLoadingState.complete, bundle.state);
          },
          error => this.searchCustomerActions.setLoadingState(SearchLoadingState.error)
        );
  }

  /**
  * This method executes, when the Initial Data loading completed.
  * The place for calling initial component methods.
  */
  private onInitCompleted(completed: boolean, initState: ISearchCustomerState) {
    if (completed) {
      this.subscribeToFieldSetup();
      this.initializeSearchForm(initState);
      this.initSubscriptions();
    }
  }

  private selectRow(customer: CustomerResult.ISearchCustomerResult): void {
    if (!this.isLocked) {
      this.searchCustomerActions.selectCustomer(customer);
    }

  }

  private cocInputValidator(control: FormControl): { [s: string]: string } {
    const searchTerm = control.value ? control.value.trim().replace(/-/i, '') : '';
    const rules = {
      'se': [10, 12],
      'no': [9],
      'fi': [8],
      'dk': [8],
      'nl-NL': [8, 11]
    };

    if (control.value && rules[this.locale] && !rules[this.locale].includes(searchTerm.length)) {
      return { 'inputLength': rules[this.locale].join(' or ') };
    }
    return null;
  }

  private updateValidators(option: string): void {
    switch (option) {
      case StringConstants.searchByKeys.id:
        this.key.setValidators([
          Validators.required,
          this.cocInputValidator.bind(this)
        ]);
        break;
      case StringConstants.searchByKeys.name:
        this.key.setValidators(Validators.required);
        break;
      case StringConstants.searchByKeys.postalCode:
        this.key.setValidators([Validators.required,
        Validators.pattern('[1-9][0-9]{3}[a-zA-Z]{2}')]);
        this.houseNumber.setValidators(
          Validators.pattern('([1-9]([0-9]+)?)?'));
        break;
    }
  }

  private setLoading(state: string = loading.LOADING) {
    this.searchCustomerActions.setLoadingState(StringConstants.getLoadingState(state));
    if (state === loading.SEARCH_IN_PROGRESS) {
      this.searchForm.disable();
    }
  }

  private subscribeToFieldSetup(): void {
    const siteSub = this.site$.subscribe((setup: string) => {
      // this.site$.first() breaks when navigating from load application By ID
      this.fieldSetup = setup;
    });
  }

  // Dont remove this method. this is used in html
  showAgreementMessage(show: boolean, event) {
    this.getInfoIconPosition(event);
    if (shouldHandleIconEvent(event)) {
      this.showAgreementMessageFlag = show;
    } else {
      this.showAgreementMessageFlag = false;
    }
  }

  private resetFormValues() {
    if (!this.isLocked) {
      this.searchCustomerActions.clearValues();
    }

    this.searchForm.markAsUntouched();
    this.by.markAsUntouched();
    this.key.markAsUntouched();
    this.key.patchValue('', { emitEvent: false });
    this.houseNumber.setValue('', { emitEvent: false });
  }

  toggleLockBubble(display: boolean, event?): void {
    if (event) {
      this.lockElID = event.target.id;
      TooltipPositionHelper.getLockBubblePosition(this._el, this.lockElID, this.lockBubbleDisplay);
      setBubbleProperties(this.lockBubbleDisplay, event, TooltipPositionHelper.isLowRes);
    }
    if (shouldHandleIconEvent(event)) {
      this.searchCustomerActions.toggleLockBubbleDisplay(display);
    } else {
      this.searchCustomerActions.toggleLockBubbleDisplay(false);
    }
  }


  getInfoIconPosition(e) {
    let bubbleDisplay: TooltipDisplay = null;
    if (e) {
      switch (e.target.id) {
        case TooltipInfoIconIds.customerConsentIcon:
          bubbleDisplay = this.showAgreementTooltipProps;
          break;
      }
      if (window.innerWidth > 767) {
        setBubbleProperties(bubbleDisplay, e);
      } else if (bubbleDisplay) {
        bubbleDisplay.tooltipPosition =
          TooltipPositionHelper.getToolTipMeasurements(e.target.id);
      }
    }
  }
}
