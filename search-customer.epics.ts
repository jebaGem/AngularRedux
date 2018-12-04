import { Injectable } from '@angular/core';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { ApiService } from '../core/account/api.service';
import { ApiScheme } from '../core/account/interfaces/api-scheme';
import {
  SearchCustomerActionTypeKeys, IGetSingleCustomerSucceeded, IClearSearchCustomerState,
  IPerformSearch,
  IPerformSearchSucceeded,
  IPerformSearchFailed
} from './search-customer.actions';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { concat } from 'rxjs/observable/concat';

import { ActionsObservable } from 'redux-observable';
import { StringConstants } from '../shared/string-constants';
import { CustomerResult } from '../core/account/interfaces/api-customer';
import { RoutesActionTypeKeys } from '../shared/routes/routes.actions';
import { Store } from 'redux';
import { IRootState } from '../store/root.state';
import { SearchLoadingState } from './search-customer.state';
import { isSearchCustomerStep } from '../shared/routes/current-step-check';
import { AppActions } from '../store/app.actions';
import {
  OverlayProperties, OverlayLabels,
  OverlayTypes
} from '../shared/overlay/overlay-properties';

/**
* Epic that orchestrates search customer actions
*
* @export
* @class SearchCustomerEpics
*/
@Injectable()
export class SearchCustomerEpics {
  constructor(private service: ApiService) { }

  searchCustomers = (action$: ActionsObservable<IPerformSearch>, store: any):
    Observable<IPerformSearchSucceeded | IPerformSearchFailed> => {
    return action$.ofType(SearchCustomerActionTypeKeys.PERFORM_SEARCH)
      .filter(() => store.getState().searchCustomerReducer.searchKey)
      .mergeMap((action: IPerformSearch) => {
        const payload: ApiScheme.IPartiesRequestArguments = this.getPartiesRequestArguments(
          store.getState().searchCustomerReducer.searchType,
          action.payload
        );
        const partyRequest = this.service.getParties(payload);
        return partyRequest.pipe(
          map(result => {
            const customers: CustomerResult.ISearchCustomerResult[] = result.data.map(
              customer => this.getCustomer(customer)
            );
            return <IPerformSearchSucceeded>{
              type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_SUCCEEDED,
              payload: customers
            };
          })
        ).catch(error => Observable.of<IPerformSearchFailed>({
          type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_FAILED
        }));
      });
  }

  private getPartiesRequestArguments(urlType: string, searchValue: string):
    ApiScheme.IPartiesRequestArguments {
    const idType: string = StringConstants.getUniqueIdentifiers(urlType);
    const request: ApiScheme.IPartiesRequestArguments = { urlType, searchValue, idType };
    return request;
  }

  private getCustomer(customer): CustomerResult.ISearchCustomerResult {
    return {
      id: customer.uniqueIdentifier,
      name: customer.name,
      address: customer.address,
      postalCode: customer.address.postalCode,
      partyId: customer.partyId
    };
  }

  getSingleCustomer = (action$: ActionsObservable<any>, store: Store<IRootState>) => {
    return action$.ofType(SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER)
      .mergeMap((action) => {
        const application = store.getState().appReducer.accountData.selectedApplication;
        return concat(
          this.service.getPartyById(action.payload).pipe(
            map(result => {
              const customer = this.mapCustomerResult(result);
              return {
                type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_SUCCEEDED,
                payload: customer
              };
            })
          ).catch(error => Observable.of({
            type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_FAILED
          })),
          Observable.of({
            type: AppActions.DISPLAY_APP_OVERLAY,
            payload: application.assessment &&
              application.assessment.result === StringConstants.creditCheckStatus.approved ?
              new OverlayProperties(OverlayLabels.dealLoadTitle, OverlayTypes.loading) : null
          }));
      });
  }

  private mapCustomerResult(raw: CustomerResult.IGetCustomerResult):
    CustomerResult.ISearchCustomerResult {
    const address = raw.company.addresses.registeredAddress;
    return {
      id: raw.company.uniqueIdentifier,
      name: raw.company.commercialName,
      address,
      postalCode: address.postalCode,
      partyId: raw.partyId
    };
  }

  mapResultToCustomerState = (action$: ActionsObservable<any>, store: Store<IRootState>) => {
    return action$.ofType(SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_SUCCEEDED)
      .mergeMap((action: IGetSingleCustomerSucceeded) => concat(
        Observable.of({
          type: SearchCustomerActionTypeKeys.SET_SEARCH_KEY,
          payload: action.payload.id
        }),
        Observable.of({
          type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_SUCCEEDED,
          payload: [action.payload]
        }),
        Observable.of({
          type: SearchCustomerActionTypeKeys.SET_CUSTOMER,
          payload: action.payload
        }),
        Observable.of({
          type: SearchCustomerActionTypeKeys.SELECT_CONSENT_CHECK_BOX,
          payload: true
        }),
        Observable.of({
          type: SearchCustomerActionTypeKeys.SET_LOADING_STATE,
          payload: SearchLoadingState.complete
        })
      ));
  }

  /**
   * Listens to routes SHOW_VALIDATION_ERROR
   * and if that action has a relevant errorID as payload
   * fire proper actions to trigger UI changes (like opening tooltips)
   *
   * @returns Observable of SET_CUSTOMER_TOOLTIP_DISPLAY in case of not selected customer
   *  @returns Observable of SET_CUSTOMER_CONSENT_TOOLTIP in case consent checkbox is not selected
   */
  watchSearchCustomerErrors = (action$: ActionsObservable<any>, store: Store<IRootState>) => {
    return action$.ofType(RoutesActionTypeKeys.SHOW_VALIDATION_ERROR)
      .filter(() => isSearchCustomerStep(store.getState()))
      .switchMap((action) => {
        if (action.payload === StringConstants.validationErrors.customerID
          && store.getState().appReducer.site === StringConstants.siteName.NL) {
          return Observable.of({
            type: SearchCustomerActionTypeKeys.SET_CUSTOMER_TOOLTIP_DISPLAY,
            payload: true
          });
        } else if (store.getState().appReducer.contractData.selectedCustomer.id &&
          store.getState().appReducer.site === StringConstants.siteName.NL &&
          action.payload === StringConstants.validationErrors.consentSelected) {
          return Observable.of({
            type: SearchCustomerActionTypeKeys.SET_CUSTOMER_CONSENT_TOOLTIP,
            payload: true
          });
        } else {
          return Observable.of({
            type: SearchCustomerActionTypeKeys.NO_CUSTOMER_SELECTED
          });
        }
      });
  }

  clearSearchCustomerState =
    (action$: ActionsObservable<any>, store: Store<IRootState>):
      Observable<IClearSearchCustomerState> => {
      return action$.ofType(AppActions.CLEAR_STATE)
        .filter(() => !!store.getState().appReducer.locale)
        .map(() => {
          return <IClearSearchCustomerState>{
            type: SearchCustomerActionTypeKeys.CLEAR_STATE
          };
        });
    }
}
