export enum SearchLoadingState {
  loading = 'loading',
  complete = 'loadingComplete',
  searchInProgress = 'searchInProgress',
  error = 'errorOccurred',
  searchError = 'searchError'
}


export interface ISearchCustomerState {
  // store/search customer model
  //
  // 'searchCustomerResult'
  // contains the search customer result items
  //
  // 'searchCustomerResultLastUpdate'
  // contain the information when the searchCustomerResult array has been updated
  //
  // 'showSelectedCustomerTooltip'
  // stores selected customerId
  //
  // 'showSelectedCustomerTooltip'
  // shows whether to display/hide the tooltip for customer selection

  searchResult: string[];
  searchType: string;
  searchKey: string;
  customerId?: string;
  consentSelected: boolean;
  showSelectCustomerTooltip: boolean;
  showConsentToolTip: boolean;
  loadingState: SearchLoadingState;
  displayLockedBubble?: boolean;
}

export const initialSearchCustomerState: ISearchCustomerState = {
  searchResult: undefined,
  searchType: 'id',
  searchKey: '',
  consentSelected: false,
  showSelectCustomerTooltip: false,
  showConsentToolTip: false,
  customerId: null,
  loadingState: SearchLoadingState.loading
};
