import { Injectable } from '@angular/core';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { ApiService } from '../core/account/api.service';
import {
  SimpleAssetActionTypeKeys, ISetFieldSetup, IGetAssetTypesFailed,
  IGetAssetTypesSucceeded, IGetBrandModels, IGetBrandModelsFailed,
  IGetBrandModelsSucceeded, IUpdateAsset, IDeleteAsset,
  IResetAssetForm, ISetTotalAssetAmount, IAddAsset,
  ISetSelectedBrandModel, IUpdateBrandModelsSucceeded,
  IDataLoadedSucceeded, IDataLoadedFailed, IUpdateAssetAmount,
  IDataLoadedInitialized, IClearSimpleAssetState
} from './simple-asset.actions';
import { Observable } from 'rxjs/Observable';
import { AppActions } from '../store/app.actions';
import { Subject } from 'rxjs/Subject';
import { StringConstants } from '../shared/string-constants';
import { ApiFinancialProductList } from '../core/account/interfaces/api-financial-product-list';
import { Asset, IBrandModel, IAssetType } from './simple-asset';
import { find, isNil, flatMap } from 'lodash';
import { ActionsObservable } from 'redux-observable';
import { IRootState } from '../store/root.state';
import { Store } from 'redux';
import * as _ from 'lodash';

@Injectable()
export class SimpleAssetEpics {
  brandModels = new Subject<string[]>();
  mode: string;

  constructor(
    private service: ApiService,
  ) { }

  /**
   * Listen to app SET_CARD_ORDER
   * to setup field configuration
   *
   * @param {ActionsObservable<any>} action$ dispatched action
   * @param {Store<IRootState>} store instance of the redux store
   * @returns Observable<ISetFieldSetup>
   */
  setFieldLayout = (action$: ActionsObservable<any>, // TODO: AppActions should be typed
    store: Store<IRootState>): Observable<ISetFieldSetup> => {
    return action$.ofType(AppActions.SET_CARD_ORDER)
      .map(() => {
        const cardOrder = store.getState().appReducer.cardOrder;
        const actionResult: ISetFieldSetup = {
          type: SimpleAssetActionTypeKeys.SET_FIELD_SETUP,
          payload: StringConstants.getFieldLayout(cardOrder)
        };
        return actionResult;
      });
  }

  ensureAssetTypesLoading = (action$: ActionsObservable<any>, // TODO: AppActions should be typed
    store: Store<IRootState>) => {
    return action$.ofType(AppActions.SET_FINANCIAL_PRODUCT,
      AppActions.SET_DEFAULT_FINANCIAL_PRODUCT)
      .filter(() => store.getState().simpleAssetsReducer.fieldSetup ===
        StringConstants.fieldSetup.nordicSetup)
      .map(result => {
        const actionResult: IDataLoadedInitialized = {
          type: SimpleAssetActionTypeKeys.DATA_LOADING_INITIALIZED,
          payload: StringConstants.loadingState.LOADING
        };
        return actionResult;
      });
  }

  /**
   * Intercept the completion of app SET_FINANCIAL_PRODUCT
   * to get the assets via service
   *
   * @param {ActionsObservable<any>} action$ dispatched action
   * @param {Store<IRootState>} store instance of the redux store
   * @returns if layout financeOptionsFirst,
   * Observable<IGetAssetTypesSucceeded | IGetAssetTypesFailed>
   */
  ensureAssetTypesLoaded = (action$: ActionsObservable<any>, // TODO: AppActions should be typed
    store: Store<IRootState>) => {
    return action$.ofType(AppActions.SET_FINANCIAL_PRODUCT,
      AppActions.SET_DEFAULT_FINANCIAL_PRODUCT)
      .filter(() => store.getState().simpleAssetsReducer.fieldSetup ===
        StringConstants.fieldSetup.nordicSetup)
      .switchMap((action) => {
        return this.resolveAssetTypes(action.payload)
          .map(result => {
            const actionResult: IGetAssetTypesSucceeded = {
              type: SimpleAssetActionTypeKeys.GET_ASSET_TYPES_SUCCEEDED,
              payload: result
            };
            return actionResult;
          })
          .catch(() => {
            const errorResult: IGetAssetTypesFailed = {
              type: SimpleAssetActionTypeKeys.GET_ASSET_TYPES_FAILED
            };
            return Observable.of(errorResult);
          });
      });
  }

  ensureAssetBrandModels = (action$: ActionsObservable<any>, // TODO: AppActions should be typed
    store: Store<IRootState>) => {
    return action$.ofType(AppActions.SET_FINANCIAL_PRODUCT)
      .filter(() => (store.getState().simpleAssetsReducer.fieldSetup ===
        StringConstants.fieldSetup.nlSetup) &&
        isNil(store.getState().simpleAssetsReducer.brandModels))
      .switchMap((action) => {
        return this.resolveBrandModels(action.payload)
          .map(result => {
            const actionResult: IGetBrandModelsSucceeded = {
              type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS_SUCCEEDED,
              payload: result
            };
            return actionResult;
          })
          .catch(() => {
            const errorResult: IGetBrandModelsFailed = {
              type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS_FAILED
            };
            return Observable.of(errorResult);
          });
      });
  }

  // This function will be replaced by the calling the real api to get the result
  private resolveAssetTypes(financeProductID:
    ApiFinancialProductList.IFinancialProduct): Observable<IAssetType[]> {
    let assetTypes: IAssetType[] = [];
    return this.service.getMasterAsset().map((data) => {
      data.masterAssetTypes.forEach(masterAsset => {
        masterAsset.categories.forEach(category => {
          [...category.assetTypes].forEach((type) => {
            type.financialProducts.forEach((product) => {
              if (product.id === financeProductID.id) {
                const productModels = flatMap(type.brands.map(brand => {
                  return brand.models.map(model =>
                    ({ id: model.modelId, name: model.modelName }));
                }));
                assetTypes = assetTypes.concat(productModels);
              }
            });
          });
        });
      });
      return assetTypes;
    });
  }

  // This function will be replaced by the calling the real api to get the result
  private resolveBrandModels(financeProductID:
    ApiFinancialProductList.IFinancialProduct): Observable<IBrandModel[]> {
    const brandModels: IBrandModel[] = [];
    return this.service.getMasterAsset().map((data) => {
      data.masterAssetTypes.forEach(masterAsset => {
        masterAsset.categories.forEach(category => {
          [...category.assetTypes].forEach(assetTypes => {
            [...assetTypes.brands].forEach(brands => {
              [...brands.models].forEach((models) => {
                const brandAndModels: IBrandModel = {
                  modelId: models.modelId,
                  modelName: models.modelName,
                  modifiedDate: models.modifiedDate,
                  financialProducts: models.financialProducts,
                  brandName: brands.brandName
                };
                if (brandAndModels.financialProducts && brandAndModels.financialProducts
                  .find(x => x.id === financeProductID.id)) {
                  brandModels.push(brandAndModels);
                }
              });
            });
          });
        });
      });
      return brandModels;
    });
  }

  /**
   * Intercept completion of GET_BRAND_MODELS
   * to load brand models via service
   *
   * @param {ActionsObservable<IGetBrandModels>} action$ dispatched action
   * @param {Store<IRootState>} store instance of the redux store
   * @returns if layout is assetFirst, Observable<IGetBrandModelsSucceeded | IGetBrandModelsFailed>
   */
  getBrandModels = (action$: ActionsObservable<IGetBrandModels>,
    store: Store<IRootState>): Observable<IGetBrandModelsSucceeded | IGetBrandModelsFailed> => {
    return action$.ofType(SimpleAssetActionTypeKeys.GET_BRAND_MODELS)
      .filter(() => store.getState().simpleAssetsReducer.fieldSetup ===
        StringConstants.fieldSetup.nlSetup &&
        store.getState().simpleAssetsReducer.brandModels.length === 0)
      .mergeMap((action) => {
        return this.resolveBrands()
          .map(result => {
            const actionResult: IGetBrandModelsSucceeded = {
              type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS_SUCCEEDED,
              payload: result
            };
            return actionResult;
          })
          .catch(() => {
            const errorResult: IGetBrandModelsFailed = {
              type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS_FAILED
            };
            return Observable.of(errorResult);
          });
      });
  }

  updateAssetTotalAmount = (action$: ActionsObservable<IUpdateAssetAmount>,
    store: Store<IRootState>): Observable<IUpdateAsset> => {
    return action$.ofType(SimpleAssetActionTypeKeys.UPDATE_ASSET_TOTAL_AMOUNT)
      .map((action) => {
        const calculatedAmount = action.payload.asset.quantity * action.payload.asset.unitPrice;
        action.payload.asset.totalAmount = calculatedAmount;
        const actionResult: IUpdateAsset = {
          type: SimpleAssetActionTypeKeys.UPDATE_ASSET,
          payload: action.payload
        };
        return actionResult;
      });
  }

  calculateTotalAssetAmount = (action$: ActionsObservable<IUpdateAsset | IDeleteAsset |
    IResetAssetForm>, store: Store<IRootState>): Observable<ISetTotalAssetAmount> => {
    let newTotal = 0;
    return action$.ofType(SimpleAssetActionTypeKeys.UPDATE_ASSET,
      SimpleAssetActionTypeKeys.DELETE_ASSET,
      SimpleAssetActionTypeKeys.RESET_ASSET_FORM)
      // only update if change also changes total amount
      .filter(() => {
        newTotal = 0;
        store.getState().simpleAssetsReducer.assets.forEach((asset: Asset) => {
          newTotal += asset.totalAmount;
        });
        return newTotal !== store.getState().simpleAssetsReducer.totalAssetAmount;
      })
      .map(() => {
        let totalAmount = 0;
        store.getState().simpleAssetsReducer.assets.forEach((asset: Asset) => {
          totalAmount += asset.totalAmount;
        });
        return <ISetTotalAssetAmount>{
          type: SimpleAssetActionTypeKeys.SET_TOTAL_ASSET_AMOUNT,
          payload: totalAmount
        };
      });
  }

  ensureDefaultValue = (action$: ActionsObservable<IDeleteAsset | IResetAssetForm>
    , store: Store<IRootState>): Observable<IAddAsset> => {
    return action$.ofType(SimpleAssetActionTypeKeys.DELETE_ASSET,
      SimpleAssetActionTypeKeys.RESET_ASSET_FORM)
      .filter(() => store.getState().simpleAssetsReducer.assets.length < 1)
      .map(() => {
        const actionResult: IAddAsset = { type: SimpleAssetActionTypeKeys.ADD_ASSET };
        return actionResult;
      });
  }

  private resolveBrands(): Observable<IBrandModel[]> {
    const brandModels: IBrandModel[] = [];
    return this.service.getMasterAsset().map((data) => {
      data.masterAssetTypes.forEach(masterAsset => {
        masterAsset.categories.forEach(category => {
          [...category.assetTypes].forEach(assetTypes => {
            [...assetTypes.brands].forEach(brands => {
              [...brands.models].forEach((models) => {
                const brandAndModels: IBrandModel = {
                  modelId: models.modelId,
                  modelName: models.modelName,
                  modifiedDate: models.modifiedDate,
                  financialProducts: models.financialProducts,
                  brandName: brands.brandName
                };
                brandModels.push(brandAndModels);
              });
            });
          });
        });
      });
      return brandModels;
    });
  }

  /**
  * Listens to app RESET_ASSET_FORM
  * to trigger a form reset
  *
  * @param {ActionsObservable<any>} action$ dispatched action
  * @param {Store<IRootState>} store instance of the redux store
  * @returns Observable<IResetAssetForm>
  */
  resetForm = (action$: ActionsObservable<any>, // TODO: AppActions should be typed
    store: Store<IRootState>): Observable<IResetAssetForm> => {
    return action$.ofType(AppActions.RESET_ASSET_FORM)
      .filter(() => store.getState().simpleAssetsReducer.fieldSetup ===
        StringConstants.fieldSetup.nordicSetup)
      .map(() => {
        const actionResult: IResetAssetForm = {
          type: SimpleAssetActionTypeKeys.RESET_ASSET_FORM
        };
        return actionResult;
      });
  }

  /**
   * Listens to simpleAsset UPDATE_ASSET
   * and triggers simpleAsset SET_SELECTED_BRAND_MODEL if necessary
   * which will in turn trigger a new filtered financial product list
   *
   * @param {ActionsObservable<IUpdateAsset>} action$ dispatched action
   * @param {Store<IRootState>} store instance of the redux store
   * @returns Observable<ISetSelectedBrandModel
    | IUpdateBrandModelsSucceeded>
   */
  triggerBrandModelUpdate = (action$: ActionsObservable<IUpdateAsset>,
    store: Store<IRootState>): Observable<ISetSelectedBrandModel
    | IUpdateBrandModelsSucceeded> => {
    return action$.ofType(SimpleAssetActionTypeKeys.UPDATE_ASSET)
      .filter(() => store.getState().simpleAssetsReducer.fieldSetup ===
        StringConstants.fieldSetup.nlSetup)
      .map((action) => {
        if (this.isBrandModelUpdated(action.payload.asset, store)) {
          const selectedModel: IBrandModel = this.getSelectedModel(action.payload.asset, store);
          const setActionResult: ISetSelectedBrandModel = {
            type: SimpleAssetActionTypeKeys.SET_SELECTED_BRAND_MODEL,
            payload: selectedModel
          };
          return setActionResult;
        }
        if (store.getState().simpleAssetsReducer.brandModels.length > 1) { }
        const updatedActionResult: IUpdateBrandModelsSucceeded = {
          type: SimpleAssetActionTypeKeys.UPDATE_BRAND_MODELS_SUCCEEDED,
          payload: null
        };
        return updatedActionResult;
      });
  }

  private isBrandModelUpdated(item: Asset, store: Store<IRootState>): boolean {
    return store.getState().simpleAssetsReducer.brandModels.length > 1 &&
      item.brandModel !== store.getState().appReducer.selectedBrandModel.modelId;
  }

  private getSelectedModel(item: Asset, store): IBrandModel {
    const allBrandModels = store.getState().simpleAssetsReducer.brandModels;
    const modelId = item.brandModel;
    return find<IBrandModel>(allBrandModels, { modelId });
  }

  /**
  * Intercepts the completion of the app Action SET_FINANCIAL_PRODUCT
  * in order to load the financial scheme
  *
  * @param {ActionsObservable<any>} action$ dispatched action
  * @returns if the a billing is not already selected Observable<IUpdateBrandModelsSucceeded>
  */
  updateBrandModel = (action$: ActionsObservable<any>): Observable<IUpdateBrandModelsSucceeded> => {
    return action$.ofType(AppActions.SET_SELECTED_BRAND_MODEL)
      .map((action) => {
        const actionResult: IUpdateBrandModelsSucceeded = {
          type: SimpleAssetActionTypeKeys.UPDATE_BRAND_MODELS_SUCCEEDED,
          payload: action.payload
        };
        return actionResult;
      });
  }


  /**
  * Listen SimpleAssetActions  GET_ASSET_TYPES_SUCCEEDED
  * Listen SimpleAssetActions GET_BRAND_MODELS_SUCCEEDED
  * in order to check the data loaded or not
  *
  * @param {ActionsObservable<IGetAssetTypesSucceeded | IGetBrandModelsSucceeded>}
  *  action$ dispatched action
  * @param {Store<IRootState>} store instance of the redux store
  * @returns Observable<IDataLoadedSucceeded> as string
  */
  ensureSimpleAssetsDataLoaded = (action$: ActionsObservable<IGetAssetTypesSucceeded
    | IGetBrandModelsSucceeded>,
    store: Store<IRootState>): Observable<IDataLoadedSucceeded> => {
    return action$.ofType(SimpleAssetActionTypeKeys.GET_ASSET_TYPES_SUCCEEDED,
      SimpleAssetActionTypeKeys.GET_BRAND_MODELS_SUCCEEDED)
      .filter(() => !isNil(store.getState().appReducer.locale))
      .map(() => {
        const actionResult: IDataLoadedSucceeded = {
          type: SimpleAssetActionTypeKeys.DATA_LOADED_SUCCEEDED,
          payload: StringConstants.loadingState.LOADING_COMPLETE
        };
        return actionResult;
      });
  }

  /**
 * Listen SimpleAssetActions GET_BRAND_MODELS_FAILED
 * Listen SimpleAssetActions GET_ASSET_TYPES_FAILED
 * in order to check the data loaded or not
 *
 * @param {ActionsObservable<IGetAssetTypesFailed | IGetBrandModelsFailed>}
 *  action$ dispatched action
 * @param {Store<IRootState>} store instance of the redux store
 * @returns Observable<IDataLoadedFailed> as string
 */
  simpleAssetDataLoadedWithError = (action$: ActionsObservable<IGetAssetTypesFailed
    | IGetBrandModelsFailed>, store: Store<IRootState>): Observable<IDataLoadedFailed> => {
    return action$.ofType(SimpleAssetActionTypeKeys.GET_ASSET_TYPES_FAILED,
      SimpleAssetActionTypeKeys.GET_BRAND_MODELS_FAILED)
      .filter(() => !isNil(store.getState().appReducer.locale))
      .map((action) => {
        const actionResult: IDataLoadedFailed = {
          type: SimpleAssetActionTypeKeys.DATA_LOADED_FAILED,
          payload: StringConstants.loadingState.ERROR_OCCURRED
        };
        return actionResult;
      });
  }

  clearFinacialProductState =
    (action$: ActionsObservable<any>, store: Store<IRootState>):
      Observable<IClearSimpleAssetState> => {
      return action$.ofType(AppActions.CLEAR_STATE)
        .filter(() => !isNil(store.getState().appReducer.locale))
        .map(() => {
          const actionResult: IClearSimpleAssetState = {
            type: SimpleAssetActionTypeKeys.CLEAR_STATE,

          };
          return actionResult;
        });
    }
}
