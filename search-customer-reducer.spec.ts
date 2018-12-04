import { searchCustomerReducer } from './search-customer.reducer';
import { initialSearchCustomerState, SearchLoadingState } from './search-customer.state';
import {
  SearchCustomerActionTypeKeys,
  IPerformSearchSucceeded, IPerformSearchFailed, ISetSearchType, ISetSearchKey,
  ISelectCustomer, ISetCustomerTooltipDisplay, ISetCustomerConsentTooltipDisplay,
  ISelectConsentCheckBox, ISetCustomerLoadingState
} from './search-customer.actions';

describe('searchCustomerReducer', () => {
  const result =
    [{ id: 'customer1', partyId: '1', name: 'customer', address: null, postalCode: '1' }];

  it('should should start with an empty state', () => {
    expect(searchCustomerReducer(initialSearchCustomerState, { type: null, payload: {} }))
      .toBe(initialSearchCustomerState);
  });

  it('should set the search result', () => {
    const action: IPerformSearchSucceeded = {
      type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_SUCCEEDED,
      payload: result
    };

    expect(searchCustomerReducer(initialSearchCustomerState, action)
      .searchResult).toEqual(result);
  });

  it('should set failure state on fail', () => {
    const action: IPerformSearchFailed = {
      type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_FAILED
    };

    expect(searchCustomerReducer(initialSearchCustomerState, action)
      .loadingState).toBe(SearchLoadingState.searchError);
  });

  it('should set the search type', () => {
    const action: ISetSearchType = {
      type: SearchCustomerActionTypeKeys.SET_SEARCH_TYPE,
      payload: 'name'
    };

    expect(searchCustomerReducer(initialSearchCustomerState, action)
      .searchType).toBe('name');
  });

  it('should set the search key', () => {
    const action: ISetSearchKey = {
      type: SearchCustomerActionTypeKeys.SET_SEARCH_KEY,
      payload: 'searchkey'
    };

    expect(searchCustomerReducer(initialSearchCustomerState, action)
      .searchKey).toBe('searchkey');
  });

  it('should set the selected result', () => {
    const action: ISelectCustomer = {
      type: SearchCustomerActionTypeKeys.SET_CUSTOMER,
      payload: result[0]
    };

    expect(searchCustomerReducer(initialSearchCustomerState, action)
      .customerId).toBe('customer1');
  });

  it('should set the tooltip displays', () => {
    const selectTooltipAction: ISetCustomerTooltipDisplay = {
      type: SearchCustomerActionTypeKeys.SET_CUSTOMER_TOOLTIP_DISPLAY,
      payload: true
    };
    const consentTooltipAction: ISetCustomerConsentTooltipDisplay = {
      type: SearchCustomerActionTypeKeys.SET_CUSTOMER_CONSENT_TOOLTIP,
      payload: true
    };

    expect(searchCustomerReducer(initialSearchCustomerState, selectTooltipAction)
      .showSelectCustomerTooltip).toBe(true);
    expect(searchCustomerReducer(initialSearchCustomerState, consentTooltipAction)
      .showConsentToolTip).toBe(true);
  });

  it('should set the consent checkbox selected', () => {
    const action: ISelectConsentCheckBox = {
      type: SearchCustomerActionTypeKeys.SELECT_CONSENT_CHECK_BOX,
      payload: true
    };

    expect(searchCustomerReducer(initialSearchCustomerState, action)
      .consentSelected).toBe(true);
  });

  it('should set the loading state', () => {
    const action: ISetCustomerLoadingState = {
      type: SearchCustomerActionTypeKeys.SET_LOADING_STATE,
      payload: SearchLoadingState.complete
    };

    expect(searchCustomerReducer(initialSearchCustomerState, action)
      .loadingState).toBe(SearchLoadingState.complete);
  });
});
