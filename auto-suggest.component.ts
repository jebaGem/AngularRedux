import {
  Component, OnInit, ViewEncapsulation,
  Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, FormControl,
  FormArray, AbstractControl
} from '@angular/forms';
import { ApiMasterAssetTypes } from '../../core/account/interfaces/api-master-asset';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { findIndex, isNil } from 'lodash';
import { SearchFilterPipe } from './filter.pipe';
import { filter, first, startWith, delay, tap } from 'rxjs/operators';
import { EuppConfigureTranslateService } from '../translation/eupp-configure-translate.service';
import { IRootState } from '../../store/root.state';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { RoutesWorkflowService } from '../routes/routes-workflow.service';

enum HandleKeyboard {
  UP = 'ArrowUp',
  DOWN = 'ArrowDown',
  ENTER = 'Enter',
  ESC = 'Escape'
}

@Component({
  selector: 'app-auto-suggest',
  templateUrl: './auto-suggest.component.html',
  styleUrls: ['./auto-suggest.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoSuggestComponent),
      multi: true
    }
  ]
})

export class AutoSuggestComponent implements OnInit,
  OnChanges, ControlValueAccessor, AfterViewInit {
  @Input() indexProperty: string;
  @Input('value') _value;  // tslint:disable-line:no-input-rename
  @Input() brandModels: ApiMasterAssetTypes.IModel[];
  @Input() searchProperty: string;
  @Output() selectedAssetFromList = new EventEmitter();
  @Output() change = new EventEmitter();
  @ViewChild('autoSuggestSearch') autoSuggestSearchElem: ElementRef;
  @select((state: IRootState) => state.routesReducer.steps[2].locked)
  stepLocked$: Observable<boolean>;
  stateForm: FormGroup;
  showDropDown = false;
  selectedId: string;
  selectedIndex = 0;
  filteredList: ApiMasterAssetTypes.IModel[] = [];
  dropdownTopPosition = '-250px';

  onChange(e) { }
  onTouched: any = () => { };

  get value() { return this._value; }

  set value(val) {
    this._value = val;
    this.setSearchText(val);
    this.onChange(val);
    this.onTouched();
  }

  get query(): string { return this.stateForm.value.search; }
  get searchInput(): AbstractControl { return this.stateForm.controls.search; }

  constructor(private fb: FormBuilder, private filterPipe: SearchFilterPipe,
    private _stepLogic: RoutesWorkflowService,
    private _euppConfigureTranslateService: EuppConfigureTranslateService) {
    this.initForm();
    this.initLockedStepListener();

  }

  ngOnInit() {
    if (this.brandModels) {
      this.selectedId = this.brandModels[0].modelId;
      this._setFilteredList();
    }
  }

  private initLockedStepListener() {

    this._stepLogic.step$.subscribe(steps => {
      if (steps[0] && steps[0].locked) {
        this.stateForm.disable();
      }
    });

  }

  ngAfterViewInit() {
    // This is really challenging and know bug in angular 5
    // https://blog.angular-university.io/angular-debugging/
    // ngAfterViewInit always throw error when there is a change in DOM
    // So to solve thi setTimeout is required
    setTimeout(() => {
      this.autoSuggestSearchElem.nativeElement.focus();
    }, 1);

  }
  // ngOnChanges listens to async props, once they are changed this function is executed
  // preventing to subscribing in each component
  ngOnChanges(changes: SimpleChanges) {
    if (!isNil(this.brandModels) && !isNil(this.value)) {
      this.value = this.value;
    }
    if (changes.brandModels.currentValue.length === 1) {
      this.searchInput.disable();
    } else if (this.searchInput.disabled) {
      this.searchInput.enable();
    }
  }

  rowHasError() {
    const row = this.stateForm.controls.search;
    return (row && row.touched && row.errors) || (row && row.touched && !this.value);
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
    if (this.value !== value) {
      this.value = value;
      this.change.emit(this.value);
    }
  }

  initForm(): FormGroup {
    return this.stateForm = this.fb.group({
      search: [null, [Validators.required]]
    });
  }

  selectValue(value) {
    this.setSearchText(value[this.indexProperty]);
    this.writeValue(value[this.indexProperty]);
    this.showDropDown = false;
  }

  closeDropDown() {
    if (this.showDropDown) {
      this.showDropDown = false;
    }
  }

  openDropDown() {
    this.onTouched();
    if (this.filteredList.length > 0) {
      this.showDropDown = true;
    } else {
      this.showDropDown = false;
    }
  }

  setSearchText(searchIndex: string) {
    if (searchIndex) {
      const foundVal = this.brandModels.find(x => x[this.indexProperty] === searchIndex);
      this.stateForm.patchValue({ 'search': foundVal[this.searchProperty] });
    } else {
      this.stateForm.patchValue({ 'search': null });
    }
  }

  // close list when the surrounding document is scrolled
  // NOTE: necessary so that the position: fixed list will not move around the screen
  @HostListener('document:scroll') onScroll() {
    this.closeDropDown();
  }

  // handle multiple autosuggest lines
  // NOTE: necessary so that the position:fixed list will not open at the same position
  @HostListener('click', ['$event']) onClickInside(e) {
    if (e.target.id === 'autoSuggestSearch') {
      this._setDropdownPosition(e.target);
    }
  }

  @HostListener('keypress', ['$event']) onKeyPressEvent(e) {
    if (e.target.id === 'autoSuggestSearch') {
      this._setDropdownPosition(e.target);
    }
  }
  // handle keyboard navigation and scroll
  keyNavigate(e: KeyboardEvent) {
    // keyboard "scroll"
    // NOTE: will not work in Safari and IE
    if (this.selectedIndex !== 0) {
      const itemNode = document.getElementsByClassName('selected')[0];
      if (itemNode) {
        itemNode.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    }

    if (e.key === HandleKeyboard.UP && this.selectedIndex !== 0) {
      this.selectedIndex--;
    }
    if (e.key === HandleKeyboard.DOWN && this.selectedIndex !== this.filteredList.length - 1) {
      if (!this.showDropDown) {
        this.openDropDown();
      } else {
        this.selectedIndex++;
      }
    }
    if (e.key === HandleKeyboard.ESC) {
      this.closeDropDown();
    }
    this.selectedId = this.filteredList[this.selectedIndex].modelId;
  }

  // handle selection by pressing Enter
  keyConfirm(e: KeyboardEvent) {
    e.preventDefault();
    this.stateForm.patchValue({ 'search': this.filteredList[this.selectedIndex].modelName });
    this.value = this.filteredList[this.selectedIndex].modelId;
    this.closeDropDown();
  }

  // adjusts selectedIndex when the list changes
  refineKeySelected() {

    this._setFilteredList();
    if (this.query) {
      if (this.filteredList.length) {
        const indexInFiltered = findIndex(this.filteredList,
          { modelId: this.brandModels[this.selectedIndex].modelId });
        if (indexInFiltered < 0) {
          this.selectedIndex = 0;
          this.selectedId = this.filteredList[0].modelId;
        } else {
          this.selectedIndex = indexInFiltered;
        }
      }
    } else {
      this.value = null;
    }
  }

  private _setFilteredList() {
    this.filteredList =
      this.filterPipe.transform(this.brandModels, this.query, this.searchProperty);
  }

  private _setDropdownPosition(basis: Element) {
    if (basis) {
      const boxBoundaries = basis.getBoundingClientRect();
      this.dropdownTopPosition = (boxBoundaries.top + 50) + 'px';
    }
  }

  getControls(frmGrp: FormGroup, key: string) {
    return (<FormArray>frmGrp.controls[key]).controls;
  }
}

