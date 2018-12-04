import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';
import { isNil } from 'lodash';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective {
  @Output() public clickOutside = new EventEmitter();
  constructor(private _elementRef: ElementRef) {

  }

  @HostListener('document:keypress', ['$event.target'])
  public onTypes(targetElement) {
    const isClickedInside = this._elementRef.nativeElement.contains(targetElement);
    if (!isClickedInside) {
      this.clickOutside.emit(null);
    }
  }
  @HostListener('document:keydown', ['$event'])
  public onTab(targetElementCode) {
    const isTabClicked = targetElementCode.key === 'Tab';
    if (isTabClicked) {
      this.clickOutside.emit(null);
    }
  }
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const isClickedInside = this._elementRef.nativeElement.contains(targetElement);
    let isClickInsideList = false;
    const isCLickInTheList = targetElement.parentElement.parentElement;
    if (!isNil(isCLickInTheList)) {
      if (targetElement.parentElement.parentElement.className.indexOf('width-half') >= 0) {
        isClickInsideList = true;
      }
    }
    if (!isClickInsideList) {
      this.clickOutside.emit(null);
    }
    if (!isClickedInside) {
      this.clickOutside.emit(null);
    }
  }
}
