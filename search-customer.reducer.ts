import {
  ISearchCustomerState, initialSearchCustomerState,
  SearchLoadingState
} from './search-customer.state';
import {
  SearchCustomerActionTypes,
  SearchCustomerActionTypeKeys,
  IToggleLockBubble
} from './search-customer.actions';
import { cloneDeep } from 'lodash';

function clearSearchCustomerState(state: ISearchCustomerState, reset: boolean):
  ISearchCustomerState {
  if (reset) {
    return initialSearchCustomerState;
  }
  return Object.assign(initialSearchCustomerState, {
    searchType: state.searchType,
    searchResult: null,
    loadingState: state.loadingState
  });
}

function setBubbleDisplay(state: ISearchCustomerState, action: IToggleLockBubble) {
  const clonedState = cloneDeep(state);
  clonedState.displayLockedBubble = action.payload;
  return clonedState;
}

export function searchCustomerReducer(
  state: ISearchCustomerState = initialSearchCustomerState,
  action: SearchCustomerActionTypes) {
  switch (action.type) {
    case SearchCustomerActionTypeKeys.PERFORM_SEARCH_SUCCEEDED:
      return {
        ...state,
        searchResult: action.payload,
      };
    case SearchCustomerActionTypeKeys.SET_SEARCH_TYPE:
      return {
        ...state,
        searchType: action.payload,
      };
    case SearchCustomerActionTypeKeys.SET_SEARCH_KEY:
      return {
        ...state,
        searchKey: action.payload,
      };
    case SearchCustomerActionTypeKeys.SET_CUSTOMER:
      return {
        ...state,
        customerId: action.payload.id
      };
    case SearchCustomerActionTypeKeys.SET_CUSTOMER_TOOLTIP_DISPLAY:
      return {
        ...state,
        showSelectCustomerTooltip: action.payload,
      };
    case SearchCustomerActionTypeKeys.SELECT_CONSENT_CHECK_BOX:
      return {
        ...state,
        consentSelected: action.payload,
      };
    case SearchCustomerActionTypeKeys.SET_CUSTOMER_CONSENT_TOOLTIP:
      return {
        ...state,
        showConsentToolTip: action.payload,
      };
    case SearchCustomerActionTypeKeys.SET_LOADING_STATE:
      return {
        ...state,
        loadingState: action.payload,
      };
    case SearchCustomerActionTypeKeys.PERFORM_SEARCH_FAILED:
      return {
        ...state,
        loadingState: SearchLoadingState.searchError,
      };
    case SearchCustomerActionTypeKeys.CLEAR_STATE:
      return clearSearchCustomerState(state, true);
    case SearchCustomerActionTypeKeys.CLEAR_FORM:
      return clearSearchCustomerState(state, false);
    case SearchCustomerActionTypeKeys.TOGGLE_LOCK_BUBBLE_DISPLAY:
      return setBubbleDisplay(state, action);
    default:
      return state;
  }
}
