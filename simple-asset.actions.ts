import { Injectable } from '@angular/core';
import { dispatch } from '@angular-redux/store';
import {
  Asset, IBrandModel,
  IAssetType, IAssetUpdatePayload
} from './simple-asset';

export enum SimpleAssetActionTypeKeys {
  SET_TOTAL_ASSET_AMOUNT = 'simple-asset/SET_TOTAL_ASSET_AMOUNT',
  SET_FIELD_SETUP = 'simple-asset/SET_FIELD_SETUP',
  GET_ASSET_TYPES_SUCCEEDED = 'simple-asset/GET_ASSET_TYPES_SUCCEEDED',
  GET_ASSET_TYPES_FAILED = 'simple-asset/GET_ASSET_TYPES_FAILED',
  GET_BRAND_MODELS = 'simple-asset/GET_BRAND_MODELS',
  GET_BRAND_MODELS_SUCCEEDED = 'simple-asset/GET_BRAND_MODELS_SUCCEEDED',
  GET_BRAND_MODELS_FAILED = 'simple-asset/GET_BRAND_MODELS_FAILED',
  RESET_ASSET_FORM = 'simple-asset/RESET_ASSET_FORM',
  UPDATE_BRAND_MODELS_SUCCEEDED = 'simple-asset/UPDATE_BRAND_MODELS_SUCCEEDED',
  SET_SELECTED_BRAND_MODEL = 'simple-asset/SET_SELECTED_BRAND_MODEL',
  ADD_ASSET = 'simple-asset/ADD_ASSET',
  STORE_ASSETS = 'simple-asset/STORE_ASSETS',
  UPDATE_ASSET_TOTAL_AMOUNT = 'simple-asset/UPDATE_ASSET_TOTAL_AMOUNT',
  UPDATE_ASSET = 'simple-asset/UPDATE_ASSET',
  DELETE_ASSET = 'simple-asset/DELETE_ASSET',
  CLEAR_ASSETS = 'simple-asset/CLEAR_ASSETS',
  DATA_LOADING_INITIALIZED = 'simple-asset/DATA_LOADING_INITIALIZED',
  DATA_LOADED_SUCCEEDED = 'simple-asset/DATA_LOADED_SUCCEEDED',
  DATA_LOADED_FAILED = 'simple-asset/DATA_LOADED_FAILED',
  CLEAR_BRAND = 'simple-asset/CLEAR_BRAND',
  CLEAR_STATE = 'simple-asset/CLEAR_STATE',
  UPDATE_ASSET_CONDITION = 'simple-asset/UPDATE_ASSET_CONDITION',
  TOGGLE_LOCK_BUBBLE_DISPLAY = 'simple-asset/TOGGLE_LOCK_BUBBLE_DISPLAY'
}

export interface ISetTotalAssetAmount {
  type: SimpleAssetActionTypeKeys.SET_TOTAL_ASSET_AMOUNT;
  payload: number;
}


export interface ISetFieldSetup {
  type: SimpleAssetActionTypeKeys.SET_FIELD_SETUP;
  payload: string;
}

export interface IGetAssetTypesSucceeded {
  type: SimpleAssetActionTypeKeys.GET_ASSET_TYPES_SUCCEEDED;
  payload: IAssetType[];
}

export interface IGetAssetTypesFailed {
  type: SimpleAssetActionTypeKeys.GET_ASSET_TYPES_FAILED;
}

export interface IGetBrandModels {
  type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS;
  payload: IAssetType;
}

export interface IGetBrandModelsSucceeded {
  type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS_SUCCEEDED;
  payload: IBrandModel[];
}

export interface IGetBrandModelsFailed {
  type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS_FAILED;
}

export interface IResetAssetForm {
  type: SimpleAssetActionTypeKeys.RESET_ASSET_FORM;
}

export interface IUpdateBrandModelsSucceeded {
  type: SimpleAssetActionTypeKeys.UPDATE_BRAND_MODELS_SUCCEEDED;
  payload: IBrandModel;
}

export interface ISetSelectedBrandModel {
  type: SimpleAssetActionTypeKeys.SET_SELECTED_BRAND_MODEL;
  payload: IBrandModel;
}

export interface IAddAsset {
  type: SimpleAssetActionTypeKeys.ADD_ASSET;
}

export interface IStoreAssets {
  type: SimpleAssetActionTypeKeys.STORE_ASSETS;
  payload: Asset[];
}

export interface IUpdateAsset {
  type: SimpleAssetActionTypeKeys.UPDATE_ASSET;
  payload: IAssetUpdatePayload;
}

export interface IUpdateAssetAmount {
  type: SimpleAssetActionTypeKeys.UPDATE_ASSET_TOTAL_AMOUNT;
  payload: IAssetUpdatePayload;
}

export interface IDeleteAsset {
  type: SimpleAssetActionTypeKeys.DELETE_ASSET;
  payload: number;
}

export interface IClearAsset {
  type: SimpleAssetActionTypeKeys.CLEAR_ASSETS;
}

export interface IDataLoadedSucceeded {
  type: SimpleAssetActionTypeKeys.DATA_LOADED_SUCCEEDED;
  payload: string;
}

export interface IDataLoadedInitialized {
  type: SimpleAssetActionTypeKeys.DATA_LOADING_INITIALIZED;
  payload: string;
}

export interface IDataLoadedFailed {
  type: SimpleAssetActionTypeKeys.DATA_LOADED_FAILED;
  payload: string;
}

export interface IClearBrand {
  type: SimpleAssetActionTypeKeys.CLEAR_BRAND;
  payload: number;
}

export interface IClearSimpleAssetState {
  type: SimpleAssetActionTypeKeys.CLEAR_STATE;
}

export interface IUpdateAssetCondition {
  type: SimpleAssetActionTypeKeys.UPDATE_ASSET_CONDITION;
  payload: boolean;
}

export interface IToggleLockBubble {
  type: SimpleAssetActionTypeKeys.TOGGLE_LOCK_BUBBLE_DISPLAY;
  payload: boolean;
}

export type SimpleAssetActionTypes =
  | ISetTotalAssetAmount
  | ISetFieldSetup
  | IGetAssetTypesSucceeded
  | IGetAssetTypesFailed
  | IDataLoadedInitialized
  | IGetBrandModels
  | IGetBrandModelsSucceeded
  | IGetBrandModelsFailed
  | IResetAssetForm
  | IUpdateBrandModelsSucceeded
  | ISetSelectedBrandModel
  | IAddAsset
  | IStoreAssets
  | IUpdateAssetAmount
  | IUpdateAsset
  | IDeleteAsset
  | IClearAsset
  | IDataLoadedSucceeded
  | IDataLoadedFailed
  | IClearBrand
  | IClearSimpleAssetState
  | IUpdateAssetCondition
  | IToggleLockBubble;


@Injectable()
export class SimpleAssetActions {
  @dispatch()
  setTotalAssetAmount(amount: number): ISetTotalAssetAmount {
    return {
      type: SimpleAssetActionTypeKeys.SET_TOTAL_ASSET_AMOUNT,
      payload: amount
    };
  }

  @dispatch()
  getBrandModels(): IGetBrandModels {
    return {
      type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS,
      payload: null
    };
  }

  @dispatch()
  addAsset(): IAddAsset {
    return {
      type: SimpleAssetActionTypeKeys.ADD_ASSET
    };
  }

  @dispatch()
  deleteAsset(index: number): IDeleteAsset {
    return {
      type: SimpleAssetActionTypeKeys.DELETE_ASSET,
      payload: index
    };
  }

  @dispatch()
  updateAsset(index: number, asset: Asset): IUpdateAssetAmount {
    const assetUpdatePayload: IAssetUpdatePayload = {
      index,
      asset
    };
    return {
      type: SimpleAssetActionTypeKeys.UPDATE_ASSET_TOTAL_AMOUNT,
      payload: assetUpdatePayload
    };
  }

  @dispatch()
  clearAssets(): IClearAsset {
    return {
      type: SimpleAssetActionTypeKeys.CLEAR_ASSETS
    };
  }

  @dispatch()
  resetForm(): IResetAssetForm {
    return {
      type: SimpleAssetActionTypeKeys.RESET_ASSET_FORM
    };
  }

  @dispatch()
  setSelectedBrandModel(brand: IBrandModel): ISetSelectedBrandModel {
    return {
      type: SimpleAssetActionTypeKeys.SET_SELECTED_BRAND_MODEL,
      payload: brand
    };
  }

  @dispatch()
  clearBrandModel(index: number): IClearBrand {
    return {
      type: SimpleAssetActionTypeKeys.CLEAR_BRAND,
      payload: index
    };
  }

  @dispatch()
  updateAssetCondition(checked: boolean): IUpdateAssetCondition {
    return {
      type: SimpleAssetActionTypeKeys.UPDATE_ASSET_CONDITION,
      payload: checked
    };
  }

  @dispatch()
  toggleLockBubbleDisplay(display: boolean): IToggleLockBubble {
    return {
      type: SimpleAssetActionTypeKeys.TOGGLE_LOCK_BUBBLE_DISPLAY,
      payload: display
    };
  }
}
