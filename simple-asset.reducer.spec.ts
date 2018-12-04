import {
  initialSimpleAssetState, ISimpleAssetState,
  Asset, IBrandModel, IAssetType, emptyAsset
} from './simple-asset';
import {
  IDataLoadedSucceeded,
  SimpleAssetActionTypeKeys,
  ISetTotalAssetAmount,
  IUpdateAssetCondition,
  IAddAsset,
  IUpdateAsset,
  IDeleteAsset,
  IGetBrandModelsSucceeded,
  IGetAssetTypesSucceeded,
  IResetAssetForm,
  IClearAsset,
  IStoreAssets,
  IClearBrand,
  IClearSimpleAssetState,
  IDataLoadedFailed,
  IDataLoadedInitialized,
  ISetFieldSetup
} from './simple-asset.actions';
import { simpleAssetsReducer } from './simple-asset.reducer';
import { StringConstants } from '../shared/string-constants';

describe('simpleAssetsReducer', () => {

  const inProgressAssetState: ISimpleAssetState = Object.assign({}, initialSimpleAssetState, {
    assets: [
      new Asset('id1', 1, 100, 100, '', 'model1'),
      new Asset('id2', 2, 50, 100, '', 'model2')
    ],
    totalAssetAmount: 200
  });

  it('it should should set loading state', () => {
    const loadingString = 'loadingComplete';
    const action: IDataLoadedSucceeded = {
      type: SimpleAssetActionTypeKeys.DATA_LOADED_SUCCEEDED,
      payload: loadingString
    };

    expect(simpleAssetsReducer(initialSimpleAssetState, action).loadingState)
      .toBe(loadingString);
  });

  it('it should set the amount to 100', () => {
    const assetTotalAmount = 100;
    const action: ISetTotalAssetAmount = {
      type: SimpleAssetActionTypeKeys.SET_TOTAL_ASSET_AMOUNT,
      payload: assetTotalAmount
    };

    expect(simpleAssetsReducer(initialSimpleAssetState, action).totalAssetAmount)
      .toBe(assetTotalAmount);
  });

  it('should set field setup', () => {
    const action: ISetFieldSetup = {
      type: SimpleAssetActionTypeKeys.SET_FIELD_SETUP,
      payload: StringConstants.fieldSetup.nlSetup
    };

    expect(simpleAssetsReducer(initialSimpleAssetState, action).fieldSetup)
      .toBe(StringConstants.fieldSetup.nlSetup);
  });

  it('should set asset condition accepted to true', () => {
    const action: IUpdateAssetCondition = {
      type: SimpleAssetActionTypeKeys.UPDATE_ASSET_CONDITION,
      payload: true
    };

    expect(simpleAssetsReducer(initialSimpleAssetState, action).assetConditionAccepted)
      .toBeTruthy();
  });

  it('should add a new asset', () => {
    const action: IAddAsset = {
      type: SimpleAssetActionTypeKeys.ADD_ASSET
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).assets.length)
      .toBe(3);
  });

  it('should update an asset', () => {
    const updatedAsset = new Asset('id1', 2, 22, 44);
    const action: IUpdateAsset = {
      type: SimpleAssetActionTypeKeys.UPDATE_ASSET,
      payload: {
        index: 0,
        asset: updatedAsset
      }
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).assets[0])
      .toEqual(updatedAsset);
  });

  it('should delete an asset', () => {
    const action: IDeleteAsset = {
      type: SimpleAssetActionTypeKeys.DELETE_ASSET,
      payload: 0
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).assets[0].id)
      .toBe('id2');
  });

  it('should reset the asset form', () => {
    const action: IResetAssetForm = {
      type: SimpleAssetActionTypeKeys.RESET_ASSET_FORM
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).assets.length)
      .toBe(0);
  });

  it('should clear the asset form', () => {
    const action: IClearAsset = {
      type: SimpleAssetActionTypeKeys.CLEAR_ASSETS
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).assets.length)
      .toBe(1);
    expect(simpleAssetsReducer(inProgressAssetState, action).assets[0])
      .toEqual(emptyAsset);
  });

  it('should store assets', () => {
    const assetsToStore = [new Asset('id1', 1, 100, 100)];
    const action: IStoreAssets = {
      type: SimpleAssetActionTypeKeys.STORE_ASSETS,
      payload: assetsToStore
    };

    expect(simpleAssetsReducer(initialSimpleAssetState, action).assets.length)
      .toBe(1);
    expect(simpleAssetsReducer(initialSimpleAssetState, action).assets[0])
      .toEqual(assetsToStore[0]);
  });

  it('should update brand models', () => {
    const brandModels: IBrandModel[] = [
      { modelId: 'model1', brandName: 'test brand', modelName: 'test model A' },
      { modelId: 'model2', brandName: 'test brand', modelName: 'test model B' }
    ];
    const action: IGetBrandModelsSucceeded = {
      type: SimpleAssetActionTypeKeys.GET_BRAND_MODELS_SUCCEEDED,
      payload: brandModels
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).brandModels)
      .toEqual(brandModels);
  });

  it('should clear brand', () => {
    const action: IClearBrand = {
      type: SimpleAssetActionTypeKeys.CLEAR_BRAND,
      payload: 0
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).assets[0].brandModel)
      .toBe('');
    expect(simpleAssetsReducer(inProgressAssetState, action).assets[0].id)
      .toBe('');
    expect(simpleAssetsReducer(inProgressAssetState, action).assets[0].brandName)
      .toBe('');
  });

  it('should clear state', () => {
    const action: IClearSimpleAssetState = {
      type: SimpleAssetActionTypeKeys.CLEAR_STATE
    };
    const expectedState = {
      assets: [emptyAsset],
      totalAssetAmount: 0,
      brandModels: []
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).assets)
      .toEqual(expectedState.assets);
    expect(simpleAssetsReducer(inProgressAssetState, action).totalAssetAmount)
      .toBe(expectedState.totalAssetAmount);
    expect(simpleAssetsReducer(inProgressAssetState, action).brandModels)
      .toEqual(expectedState.brandModels);
  });

  it('should update asset types', () => {
    const assetTypes: IAssetType[] = [
      { id: 'model1', brandName: 'test brand', name: 'test model A' },
      { id: 'model2', brandName: 'test brand', name: 'test model B' }
    ];
    const action: IGetAssetTypesSucceeded = {
      type: SimpleAssetActionTypeKeys.GET_ASSET_TYPES_SUCCEEDED,
      payload: assetTypes
    };

    expect(simpleAssetsReducer(inProgressAssetState, action).assetTypes)
      .toEqual(assetTypes);
  });

  it('should update data loaded state', () => {
    const actionPending: IDataLoadedInitialized = {
      type: SimpleAssetActionTypeKeys.DATA_LOADING_INITIALIZED,
      payload: StringConstants.loadingState.LOADING
    };
    const actionSuccess: IDataLoadedSucceeded = {
      type: SimpleAssetActionTypeKeys.DATA_LOADED_SUCCEEDED,
      payload: StringConstants.loadingState.LOADING_COMPLETE
    };
    const actionFailed: IDataLoadedFailed = {
      type: SimpleAssetActionTypeKeys.DATA_LOADED_FAILED,
      payload: StringConstants.loadingState.ERROR_OCCURRED
    };

    expect(simpleAssetsReducer(initialSimpleAssetState, actionPending).loadingState)
      .toBe(StringConstants.loadingState.LOADING);
    expect(simpleAssetsReducer(initialSimpleAssetState, actionSuccess).loadingState)
      .toBe(StringConstants.loadingState.LOADING_COMPLETE);
    expect(simpleAssetsReducer(initialSimpleAssetState, actionFailed).loadingState)
      .toBe(StringConstants.loadingState.ERROR_OCCURRED);
  });

});
