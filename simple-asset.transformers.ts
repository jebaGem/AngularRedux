import { Observable } from 'rxjs/Observable';
import { ISimpleAssetState, Asset, IBrandModel } from './simple-asset';
import { FormArray, FormControl, Validators, FormGroup } from '@angular/forms';
import { StringConstants } from '../shared/string-constants';
import { isNil, isEqual } from 'lodash';
import { ApiAccountData } from '../core/account/interfaces/api-account';
import { IRootState } from '../store/root.state';

export const getFormArrayFromObj =
  (state$: Observable<IRootState>): Observable<any> =>
    state$.map(state => {
      const { fieldSetup, assets, assetTypes, brandModels } = state.simpleAssetsReducer;
      const assetRows = [];
      if (!assets || !fieldSetup) {
        return new FormArray(assetRows);
      }
      // Return empty row if assetTypes are not loaded for nordicSetup
      // else return empty row if brandModels are not loaded for nlSetup
      if (fieldSetup === StringConstants.fieldSetup.nordicSetup &&
        (!assetTypes || assetTypes.length < 1)) {
        return new FormArray(assetRows);
      } else if (fieldSetup === StringConstants.fieldSetup.nlSetup &&
        (!brandModels || brandModels.length < 1)) {
        return new FormArray(assetRows);
      }

      assets.forEach((asset: Asset, i: number) => {
        const unitPrice: string | number = asset.unitPrice === 0 ? '' : asset.unitPrice;
        let controls = {
          ind: new FormControl(i),

          unitPrice: new FormControl(unitPrice, [Validators.required]),
          totalAmount: new FormControl(asset.totalAmount),
        };
        if (fieldSetup === StringConstants.fieldSetup.nlSetup) {
          const defaultModel = brandModels[0];
          const brandModel: any = (asset.brandModel !== '')
            ? asset.brandModel
            : defaultModel.modelId;

          const brandName: string = !isNil(asset.brandName) && asset.brandName !== ''
            ? asset.brandName
            : defaultModel.brandName;
          const brandId: string = !isNil(asset.id) && asset.id !== ''
            ? asset.id
            : defaultModel.modelId;
          const quantity: string | number = asset.quantity === 0 ? 1 : asset.quantity;
          controls = Object.assign({}, controls, {
            brandModel: new FormControl(brandModel, [Validators.required]),
            year: new FormControl(asset.year),
            brandName: new FormControl(brandName),
            quantity: new FormControl(quantity, [Validators.min(1), Validators.required]),
          });

        } else if (fieldSetup === StringConstants.fieldSetup.nordicSetup) {
          const assetType = (asset.assetType !== '') ? asset.assetType : assetTypes[0].name;
          const quantity: string | number = asset.quantity === 0 ? '' : asset.quantity;
          controls = Object.assign({}, controls, {
            assetType: new FormControl(assetType, [Validators.required]),
            description: new FormControl(asset.description, [Validators.required]),
            quantity: new FormControl(quantity, [Validators.min(1), Validators.required]),
          });
        }

        if (!isNil(state.appReducer.steps.active) && state.appReducer.steps.active.locked) {
          Object.keys(controls).forEach(ctrlName => {
            controls[ctrlName].disable();
          });
        }

        assetRows.push(new FormGroup(controls));
      });
      return new FormArray(assetRows);
    });

export const get100Items =
  (brandModels$: Observable<IBrandModel[]>): Observable<IBrandModel[]> =>
    brandModels$.map(items => items.slice(0, 100));

export const canLoadData = (account$: Observable<ApiAccountData.IApiAccountData>)
  : Observable<boolean> =>
  account$.map(account => {
    return (!isNil(account) &&
      !isNil(account.id) &&
      !isNil(account.name) &&
      !isNil(account.programId));
  });
