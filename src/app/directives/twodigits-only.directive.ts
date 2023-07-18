import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTwodigitsOnly]'
})
export class TwodigitsOnlyDirective {

  constructor(private elementRef: ElementRef,@Optional() private ngControl: NgControl) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const pattern = /^(\d{0,2}(\.\d{0,2})?)?$/;
    const isValid = pattern.test(value);

    if (!isValid) {
      this.elementRef.nativeElement.value = value.slice(0, -1);
      if (this.ngControl) {
        this.ngControl.control?.setValue(this.elementRef.nativeElement.value);
      }
    } else {
      if (this.ngControl) {
        this.ngControl.control?.setValue(value);
      }
    }
  }

}
