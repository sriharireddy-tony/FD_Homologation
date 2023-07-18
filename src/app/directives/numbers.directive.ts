import { Directive, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumbers]'
})
export class NumbersDirective {
  constructor(private elementRef: ElementRef, @Optional() private ngControl: NgControl) {}

  private isProgrammaticChange = false;

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const pattern = /^\d*$/; // Updated pattern to disallow dots and decimals
    const isValid = pattern.test(value);

    if (!isValid) {
      this.elementRef.nativeElement.value = value.replace(/[^\d]/g, '');
      if (this.ngControl && !this.isProgrammaticChange) {
        this.ngControl.control?.setValue(this.elementRef.nativeElement.value);
      }
    } else {
      if (this.ngControl && !this.isProgrammaticChange) {
        this.ngControl.control?.setValue(value);
      }
    }
  }
}
