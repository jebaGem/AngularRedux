import { ActionsObservable } from 'redux-observable';
import { TestBed, getTestBed, async } from '@angular/core/testing';
import {
  NgReduxTestingModule, MockNgRedux,
  MockObservableStore
} from '@angular-redux/store/testing';
import { Observable } from 'rxjs/Observable';
import { IRootState } from '../store/root.state';
import { SearchCustomerEpics } from './search-customer.epics';
import { ApiService } from '../core/account/api.service';
import { SearchCustomerActionTypeKeys } from './search-customer.actions';
import { SearchLoadingState } from './search-customer.state';
import { find } from 'lodash';
import { RoutesActionTypeKeys } from '../shared/routes/routes.actions';
import { StringConstants } from '../shared/string-constants';
import { AppActions } from '../store/app.actions';

describe('searchCustomerEpics', () => {
  const partiesResponse =
    require('../../assets/data/cisco-json-prod-validation/parties/30249739H00.json');
  const mappedPartiesResponse = partiesResponse.data.map(customer => {
    return {
      id: customer.uniqueIdentifier,
      name: customer.name,
      address: customer.address,
      postalCode: customer.address.postalCode,
      partyId: customer.partyId
    };
  });

  const singlePartyResponse =
    require('../../assets/data/cisco-json-prod-validation/parties/33255347H00.json');
  const singleParty = singlePartyResponse.data[0];
  const address = singleParty.company.addresses.registeredAddress;
  const mappedSingleParty = {
    id: singleParty.company.uniqueIdentifier,
    name: singleParty.company.commercialName,
    address,
    postalCode: address.postalCode,
    partyId: singleParty.partyId
  };

  let injector: any;
  const apiServiceStub = jasmine.createSpyObj('ApiService', [
    'getPartyById', 'getParties']);

  const mockStore = new MockObservableStore<IRootState>();

  let searchCustomerEpics: SearchCustomerEpics;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgReduxTestingModule
      ],
      providers: [
        SearchCustomerEpics,
        { provide: ApiService, useValue: apiServiceStub }
      ]
    });
    injector = getTestBed();
    searchCustomerEpics = injector.get(SearchCustomerEpics);
    MockNgRedux.reset();
  }));

  it('dispatches search success after a successfully found parties', () => {
    const action = ActionsObservable.of({
      type: SearchCustomerActionTypeKeys.PERFORM_SEARCH
    });

    const expectedDispatch = {
      type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_SUCCEEDED,
      payload: mappedPartiesResponse
    };

    spyOn(mockStore, 'getState').and.returnValue({
      searchCustomerReducer: {
        searchType: 'id',
        searchKey: '30249739H00'
      }
    });

    apiServiceStub.getParties.and.returnValue(Observable.of(partiesResponse));

    searchCustomerEpics.getSingleCustomer(action, mockStore)
      .subscribe((outputAction) => {
        expect(outputAction).toEqual(expectedDispatch);
      });
  });

  it('dispatches search failed after a failed found parties', () => {
    const action = ActionsObservable.of({
      type: SearchCustomerActionTypeKeys.PERFORM_SEARCH
    });

    const expectedDispatch = {
      type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_FAILED
    };

    spyOn(mockStore, 'getState').and.returnValue({
      searchCustomerReducer: {
        searchType: 'id',
        searchKey: '30249739H00'
      }
    });

    apiServiceStub.getParties.and.returnValue(Observable.of(new Error('hello')));

    searchCustomerEpics.getSingleCustomer(action, mockStore)
      .subscribe((outputAction) => {
        expect(outputAction).toEqual(expectedDispatch);
      });
  });

  it('dispatches get action success after a successful get single party request', () => {
    const action = ActionsObservable.of({
      type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER,
      payload: singleParty.partyId
    });

    const expectedDispatch = {
      type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_SUCCEEDED,
      payload: mappedSingleParty
    };

    spyOn(mockStore, 'getState').and.returnValue({
      appReducer: {
        accountData: {
          selectedApplication: {
            assessment: {}
          }
        }
      }
    });

    apiServiceStub.getPartyById.and.returnValue(Observable.of(singleParty));

    searchCustomerEpics.getSingleCustomer(action, mockStore)
      .subscribe((outputAction) => {
        switch (outputAction.type) {
          case SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_SUCCEEDED:
            expect(outputAction).toEqual(expectedDispatch);
            break;
          case AppActions.DISPLAY_APP_OVERLAY:
            break;
          default:
            fail('Unexpected action');
        }
      });
  });

  it('dispatches get actionfailed after a failed get single party request', () => {
    const action = ActionsObservable.of({
      type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER,
      payload: singleParty.partyId
    });

    const expectedDispatch = { type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_FAILED };

    spyOn(mockStore, 'getState').and.returnValue({
      appReducer: {
        accountData: {
          selectedApplication: {
            assessment: {}
          }
        }
      }
    });

    apiServiceStub.getPartyById.and
      .returnValue(Observable.of(new Error('hello')));

    searchCustomerEpics.getSingleCustomer(action, mockStore)
      .subscribe((outputAction) => {
        switch (outputAction.type) {
          case SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_FAILED:
            expect(outputAction).toEqual(expectedDispatch);
            break;
          case AppActions.DISPLAY_APP_OVERLAY:
            break;
          default:
            fail('Unexpected action');
        }
      });
  });

  it('dispatches a series of actions after a success action', () => {
    const action = ActionsObservable.of({
      type: SearchCustomerActionTypeKeys.GET_SINGLE_CUSTOMER_SUCCEEDED,
      payload: mappedSingleParty
    });

    const expectedDispatches = [
      {
        type: SearchCustomerActionTypeKeys.SET_SEARCH_KEY,
        payload: mappedSingleParty.id
      },
      {
        type: SearchCustomerActionTypeKeys.PERFORM_SEARCH_SUCCEEDED,
        payload: [mappedSingleParty]
      },
      {
        type: SearchCustomerActionTypeKeys.SET_CUSTOMER,
        payload: mappedSingleParty
      },
      {
        type: SearchCustomerActionTypeKeys.SELECT_CONSENT_CHECK_BOX,
        payload: true
      },
      {
        type: SearchCustomerActionTypeKeys.SET_LOADING_STATE,
        payload: SearchLoadingState.complete
      }
    ];

    const output = [];

    searchCustomerEpics.mapResultToCustomerState(action, mockStore).subscribe((outputAction) => {
      const dispatch = find(expectedDispatches, { type: outputAction.type });
      expect(dispatch).toBeDefined();
      expect(dispatch.payload).toEqual(outputAction.payload);
      output.push(outputAction);
    }, err => console.log(
      new Error('Error in searchCustomerEpics.mapResultToCustomerState unit test'), err),
      () => {
        output.forEach((dispatchedAction, i) => {
          expect(dispatchedAction).toEqual(expectedDispatches[i]);
        });
      });
  });


  it('dispatches select customer tooltip in case a validation is triggered', () => {
    const action = ActionsObservable.of({
      type: RoutesActionTypeKeys.SHOW_VALIDATION_ERROR,
      payload: StringConstants.validationErrors.customerID
    });

    const expectedDispatch = {
      type: SearchCustomerActionTypeKeys.SET_CUSTOMER_TOOLTIP_DISPLAY,
      payload: true
    };

    spyOn(mockStore, 'getState').and.returnValue({
      appReducer: {
        steps: {
          active: {
            id: 'search-customer'
          }
        },
        site: StringConstants.siteName.NL
      },
      routesReducer: {
        steps: [
          {},
          { id: 'search-customer' }
        ]
      }
    });

    searchCustomerEpics.getSingleCustomer(action, mockStore)
      .subscribe((outputAction) => {
        expect(outputAction).toEqual(expectedDispatch);
      });
  });

  it('dispatches select customer tooltip in case a validation is triggered', () => {
    const action = ActionsObservable.of({
      type: RoutesActionTypeKeys.SHOW_VALIDATION_ERROR,
      payload: StringConstants.validationErrors.consentSelected
    });

    const expectedDispatch = {
      type: SearchCustomerActionTypeKeys.SET_CUSTOMER_CONSENT_TOOLTIP,
      payload: true
    };

    spyOn(mockStore, 'getState').and.returnValue({
      appReducer: {
        steps: {
          active: {
            id: 'search-customer'
          }
        },
        site: StringConstants.siteName.NL,
        contractData: {
          selectedCustomer: {
            id: 'selected'
          }
        }
      },
      routesReducer: {
        steps: [
          {},
          { id: 'search-customer' }
        ]
      }
    });

    searchCustomerEpics.getSingleCustomer(action, mockStore)
      .subscribe((outputAction) => {
        expect(outputAction).toEqual(expectedDispatch);
      });
  });

  it('dispatches select customer tooltip in case a validation is triggered', () => {
    const action = ActionsObservable.of({
      type: RoutesActionTypeKeys.SHOW_VALIDATION_ERROR,
      payload: null
    });

    const expectedDispatch = {
      type: SearchCustomerActionTypeKeys.NO_CUSTOMER_SELECTED
    };

    spyOn(mockStore, 'getState').and.returnValue({
      appReducer: {
        steps: {
          active: {
            id: 'search-customer'
          }
        }
      },
      routesReducer: {
        steps: [
          {},
          { id: 'search-customer' }
        ]
      }
    });

    searchCustomerEpics.getSingleCustomer(action, mockStore)
      .subscribe((outputAction) => {
        expect(outputAction).toEqual(expectedDispatch);
      });
  });
});
