import { StringConstants } from '../shared/string-constants';

const totalAssetAmount = 0;

export interface ISimpleAssetState {
  totalAssetAmount: number;
  assets: Asset[];
  brandModels: IBrandModel[];
  assetTypes: IAssetType[];
  resetForm: string;
  fieldSetup: string;
  loadingState: string;
  assetConditionAccepted?: boolean;
  displayLockedBubble?: boolean;
}

export interface IAssetType {
  id?: string;
  name: string;
  brandName?: string;
}

export class Asset {
  constructor(
    public id: string,
    public quantity: number,
    public unitPrice: number,
    public totalAmount: number,
    public assetType?: string,
    public brandModel?: string,
    public year?: string,
    public description?: string,
    public modelName?: string,
    public brandName?: string
  ) { }
}

export const emptyAsset = new Asset('',
  0, 0, 0, '', '', new Date().getFullYear().toString(), '');
export const initialSimpleAssetState: ISimpleAssetState = {
  totalAssetAmount,
  assets: [emptyAsset],
  brandModels: [],
  assetTypes: [],
  resetForm: '',
  fieldSetup: '',
  loadingState: StringConstants.loadingState.LOADING
};

export interface IAssetUpdatePayload {
  index: number;
  asset: Asset;
}

export namespace IAssetAction {
  export interface StringPayload {
    type: string;
    payload: string;
  }
}

export interface IBrandModel {
  modelId: string;
  modelName: string;
  modifiedDate?: string;
  financialProducts?: IBrandModelFinancialProduct[];
  brandName?: string;
}

export interface IBrandModelFinancialProduct {
  id: string;
  url: string;
}


