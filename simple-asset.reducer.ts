import {
  ISimpleAssetState,
  initialSimpleAssetState,
  emptyAsset,
  Asset,
} from './simple-asset';
import {
  SimpleAssetActionTypes,
  SimpleAssetActionTypeKeys,
  ISetTotalAssetAmount,
  IGetAssetTypesSucceeded,
  IGetBrandModelsSucceeded,
  IDeleteAsset,
  IUpdateAsset,
  ISetFieldSetup,
  IDataLoadedSucceeded,
  IDataLoadedFailed,
  IStoreAssets,
  IClearBrand,
  IDataLoadedInitialized,
  IClearSimpleAssetState,
  IUpdateAssetCondition,
  IToggleLockBubble
} from './simple-asset.actions';
import { cloneDeep } from 'lodash';

function storeTotalAssetAmount(state: ISimpleAssetState,
  action: ISetTotalAssetAmount): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.totalAssetAmount = action.payload;
  return clonedState;
}
function updateAsset(state: ISimpleAssetState, action: IUpdateAsset): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  const updatedAsset = action.payload.asset;
  clonedState.assets[action.payload.index] = updatedAsset;
  return clonedState;
}

function addAsset(state: ISimpleAssetState): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  if (!state.assets) {
    clonedState.assets = [emptyAsset];
  } else {
    clonedState.assets = [...clonedState.assets, emptyAsset];
  }
  return clonedState;
}

function storeAssets(state: ISimpleAssetState, action: IStoreAssets): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.assets = action.payload;
  return clonedState;
}

function clearAssets(state: ISimpleAssetState): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.assets = [emptyAsset];
  return clonedState;
}

function deleteAsset(state: ISimpleAssetState, action: IDeleteAsset): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.assets = clonedState.assets
    .filter((asset, index) => index !== action.payload);
  return clonedState;
}

function updateAssetTypes(state: any, action: IGetAssetTypesSucceeded): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.assetTypes = action.payload;
  return clonedState;
}

function updateBrandModels(state: any, action: IGetBrandModelsSucceeded): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.brandModels = action.payload;
  return clonedState;
}

function resetAssetForm(state: ISimpleAssetState): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.assets = [];
  return clonedState;
}

function storeFieldSetup(state: ISimpleAssetState, action: ISetFieldSetup): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.fieldSetup = action.payload;
  return clonedState;
}

function storeDataLoadedState(state: ISimpleAssetState,
  action: IDataLoadedSucceeded | IDataLoadedFailed | IDataLoadedInitialized): ISimpleAssetState {
  const clonedState = cloneDeep(state);
  clonedState.loadingState = action.payload;
  return clonedState;
}

function storeClearedBrand(state: ISimpleAssetState, action: IClearBrand) {
  const clonedState = cloneDeep(state);
  clonedState.assets[action.payload].brandModel = '';
  clonedState.assets[action.payload].id = '';
  clonedState.assets[action.payload].brandName = '';
  return clonedState;
}

function clearState(state: ISimpleAssetState, action: IClearSimpleAssetState) {
  const clonedState = cloneDeep(state);
  clonedState.totalAssetAmount = 0;
  clonedState.assets = [emptyAsset];
  clonedState.brandModels = [];
  return clonedState;
}

function storeAssetCondition(state: ISimpleAssetState, action: IUpdateAssetCondition) {
  const clonedState = cloneDeep(state);
  clonedState.assetConditionAccepted = action.payload;
  return clonedState;
}

function setBubbleDisplay(state: ISimpleAssetState, action: IToggleLockBubble) {
  const clonedState = cloneDeep(state);
  clonedState.displayLockedBubble = action.payload;
  return clonedState;
}

export function simpleAssetsReducer(state: ISimpleAssetState = initialSimpleAssetState,
  action: SimpleAssetActionTypes) {
  switch (action.type) {
    case SimpleAssetActionTypeKeys.SET_TOTAL_ASSET_AMOUNT:
      return storeTotalAssetAmount(state, action);
    case SimpleAssetActionTypeKeys.GET_ASSET_TYPES_SUCCEEDED:
      return updateAssetTypes(state, action);
    case SimpleAssetActionTypeKeys.GET_BRAND_MODELS_SUCCEEDED:
      return updateBrandModels(state, action);
    case SimpleAssetActionTypeKeys.ADD_ASSET:
      return addAsset(state);
    case SimpleAssetActionTypeKeys.STORE_ASSETS:
      return storeAssets(state, action);
    case SimpleAssetActionTypeKeys.CLEAR_ASSETS:
      return clearAssets(state);
    case SimpleAssetActionTypeKeys.DELETE_ASSET:
      return deleteAsset(state, action);
    case SimpleAssetActionTypeKeys.UPDATE_ASSET:
      return updateAsset(state, action);
    case SimpleAssetActionTypeKeys.RESET_ASSET_FORM:
      return resetAssetForm(state);
    case SimpleAssetActionTypeKeys.SET_FIELD_SETUP:
      return storeFieldSetup(state, action);
    case SimpleAssetActionTypeKeys.DATA_LOADED_SUCCEEDED:
    case SimpleAssetActionTypeKeys.DATA_LOADED_FAILED:
    case SimpleAssetActionTypeKeys.DATA_LOADING_INITIALIZED:
      return storeDataLoadedState(state, action);
    case SimpleAssetActionTypeKeys.CLEAR_BRAND:
      return storeClearedBrand(state, action);
    case SimpleAssetActionTypeKeys.CLEAR_STATE:
      return clearState(state, action);
    case SimpleAssetActionTypeKeys.UPDATE_ASSET_CONDITION:
      return storeAssetCondition(state, action);
    case SimpleAssetActionTypeKeys.TOGGLE_LOCK_BUBBLE_DISPLAY:
      return setBubbleDisplay(state, action);
    default:
      return state;
  }
}
