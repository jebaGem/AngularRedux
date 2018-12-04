import { Injectable } from '@angular/core';
import { NgRedux, dispatch } from '@angular-redux/store';
import { IAppState } from '../store';
import { CustomerResult } from '../core/account/interfaces/api-customer';
import { SearchLoadingState } from './search-customer.state';

/**
 * Action TypeKeys as Enum
 * String enums solve a number of problems with prior approaches.
 * it gives a convenient way to define string constants that are
 * narrowly typed to specific values.
 */
export enum SearchCustomerActionTypeKeys {
  PERFORM_SEARCH = 'search-customer/PERFORM_SEARCH',
  PERFORM_SEARCH_SUCCEEDED = 'search-customer/PERFORM_SEARCH_SUCCEEDED',
  PERFORM_SEARCH_FAILED = 'search-customer/PERFORM_SEARCH_FAILED',
  GET_SINGLE_CUSTOMER = 'search-customer/GET_CUSTOMER',
  GET_SINGLE_CUSTOMER_SUCCEEDED = 'search-customer/GET_SINGLE_CUSTOMER_SUCCEEDED',
  GET_SINGLE_CUSTOMER_FAILED = 'search-customer/GET_SINGLE_CUSTOMER_FAILED',
  SET_SEARCH_TYPE = 'search-customer/SET_SEARCH_TYPE',
  SET_SEARCH_KEY = 'search-customer/SET_SEARCH_KEY',
  SET_CUSTOMER = 'search-customer/SET_CUSTOMER',
  SET_CUSTOMER_TOOLTIP_DISPLAY = 'search-customer/SET_CUSTOMER_TOOLTIP_DISPLAY',
  SELECT_CONSENT_CHECK_BOX = 'search-customer/SELECT_CONSENT_CHECK_BOX',
  SET_CUSTOMER_CONSENT_TOOLTIP = 'search-customer/SET_CUSTOMER_CONSENT_TOOLTIP',
  NO_CUSTOMER_SELECTED = 'search-customer/NO_CUSTOMER_SELECTED',
  SET_LOADING_STATE = 'search-customer/SET_LOADING_STATE',
  REQUEST_REMOVE_VALIDATION_ERROR = 'search-customer/REQUEST_REMOVE_VALIDATION_ERROR',
  CLEAR_STATE = 'search-customer/CLEAR_STATE',
  CLEAR_FORM = 'search-customer/CLEAR_FORM',
  TOGGLE_LOCK_BUBBLE_DISPLAY = 'search-customer/TOGGLE_LOCK_BUBBLE_DISPLAY',
  CLEAR_SELECTED_CUSTOMER = 'search-customer/CLEAR_SELECTED_CUSTOMER'
}

export interface IRemoveValidationError {
  type: SearchCustomerActionTypeKeys.REQUEST_REMOVE_VALIDATION_ERROR;
  payload: string;
}

export interface IPerformSearch {
  type: SearchCustomerActionTypeKeys.PERFORM_SEARCH;
  payload: string;
}
export interface IPerformSearchSucceeded {
  type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_SUCCEEDED;
  payload: Array<CustomerResult.ISearchCustomerResult>;
}
export interface IPerformSearchFailed {
  type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_FAILED;
}
export interface IGetSingleCustomer {
  type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER;
  payload: string;
}
export interface IGetSingleCustomerSucceeded {
  type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_SUCCEEDED;
  payload: CustomerResult.ISearchCustomerResult;
}
export interface IGetSingleCustomerFailed {
  type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_FAILED;
}
export interface ISetSearchType {
  type: SearchCustomerActionTypeKeys.SET_SEARCH_TYPE;
  payload: string;
}
export interface ISetSearchKey {
  type: SearchCustomerActionTypeKeys.SET_SEARCH_KEY;
  payload: string;
}
export interface ISelectCustomer {
  type: SearchCustomerActionTypeKeys.SET_CUSTOMER;
  payload: CustomerResult.ISearchCustomerResult;
}
export interface ISetCustomerLoadingState {
  type: SearchCustomerActionTypeKeys.SET_LOADING_STATE;
  payload: SearchLoadingState;
}

export interface ISelectConsentCheckBox {
  type: SearchCustomerActionTypeKeys.SELECT_CONSENT_CHECK_BOX;
  payload: boolean;
}
export interface ISetCustomerTooltipDisplay {
  type: SearchCustomerActionTypeKeys.SET_CUSTOMER_TOOLTIP_DISPLAY;
  payload: boolean;
}

export interface ISetCustomerConsentTooltipDisplay {
  type: SearchCustomerActionTypeKeys.SET_CUSTOMER_CONSENT_TOOLTIP;
  payload: boolean;
}

export interface ISetCustomerSelected {
  type: SearchCustomerActionTypeKeys.NO_CUSTOMER_SELECTED;
  payload: boolean;
}

export interface IClearSearchCustomerState {
  type: SearchCustomerActionTypeKeys.CLEAR_STATE;
}

export interface IClearCustomerForm {
  type: SearchCustomerActionTypeKeys.CLEAR_FORM;
}

export interface IToggleLockBubble {
  type: SearchCustomerActionTypeKeys.TOGGLE_LOCK_BUBBLE_DISPLAY;
  payload: boolean;
}

export interface IClearSelectedCustomer {
  type: SearchCustomerActionTypeKeys.CLEAR_SELECTED_CUSTOMER;
}
export type SearchCustomerActionTypes =
  | IPerformSearch
  | IPerformSearchFailed
  | IPerformSearchSucceeded
  | IGetSingleCustomer
  | IGetSingleCustomerSucceeded
  | IGetSingleCustomerFailed
  | ISetSearchType
  | ISetSearchKey
  | ISelectCustomer
  | ISelectConsentCheckBox
  | ISetCustomerTooltipDisplay
  | ISetCustomerConsentTooltipDisplay
  | ISetCustomerSelected
  | ISetCustomerLoadingState
  | IRemoveValidationError
  | IClearSearchCustomerState
  | IClearCustomerForm
  | IToggleLockBubble
  | IClearSelectedCustomer;

@Injectable()
export class SearchCustomerActions {
  constructor(private ngRedux: NgRedux<IAppState>) { }
  @dispatch() performSearch = (query: string): IPerformSearch => ({
    type: SearchCustomerActionTypeKeys.PERFORM_SEARCH,
    payload: query
  })
  @dispatch() setSearchType = (by: string): ISetSearchType => ({
    type: SearchCustomerActionTypeKeys.SET_SEARCH_TYPE,
    payload: by
  })
  @dispatch() setSearchKey = (key: string): ISetSearchKey => ({
    type: SearchCustomerActionTypeKeys.SET_SEARCH_KEY,
    payload: key
  })
  @dispatch() selectCustomer = (customer: CustomerResult.ISearchCustomerResult):
    ISelectCustomer => ({
      type: SearchCustomerActionTypeKeys.SET_CUSTOMER,
      payload: customer
    })
  @dispatch() setCustomerTooltipDisplay = (show: boolean): ISetCustomerTooltipDisplay => ({
    type: SearchCustomerActionTypeKeys.SET_CUSTOMER_TOOLTIP_DISPLAY,
    payload: show
  })
  @dispatch() setLoadingState = (loadingState: SearchLoadingState): ISetCustomerLoadingState => ({
    type: SearchCustomerActionTypeKeys.SET_LOADING_STATE,
    payload: loadingState
  })

  /**
   * For NL the consent check box should be selected. if not show the tool tip to select
   * the consent check box
   */

  @dispatch() selectConsentBox = (selected: boolean): ISelectConsentCheckBox => ({
    type: SearchCustomerActionTypeKeys.SELECT_CONSENT_CHECK_BOX,
    payload: selected
  })

  @dispatch() setCustomerConsentTooltipDisplay = (show: boolean):
    ISetCustomerConsentTooltipDisplay =>
    ({
      type: SearchCustomerActionTypeKeys.SET_CUSTOMER_CONSENT_TOOLTIP,
      payload: show
    })

  @dispatch()
  requestRemoveValidationError(payload: string): IRemoveValidationError {
    return {
      type: SearchCustomerActionTypeKeys.REQUEST_REMOVE_VALIDATION_ERROR,
      payload
    };
  }

  @dispatch()
  clearValues(): IClearCustomerForm {
    return {
      type: SearchCustomerActionTypeKeys.CLEAR_FORM
    };
  }

  @dispatch()
  toggleLockBubbleDisplay(display: boolean): IToggleLockBubble {
    return {
      type: SearchCustomerActionTypeKeys.TOGGLE_LOCK_BUBBLE_DISPLAY,
      payload: display
    };
  }

  @dispatch()
  clearSelectedCustomer(): IClearSelectedCustomer {
    return {
      type: SearchCustomerActionTypeKeys.CLEAR_SELECTED_CUSTOMER
    };
  }

}
