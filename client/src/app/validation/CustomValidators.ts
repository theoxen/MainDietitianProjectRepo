import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static maxTwoDecimalPlaces(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
        return { maxTwoDecimalPlaces: true };
      }
      return null;
    };
  }
}