import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateBeforeTodayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const [day, month, year] = control.value.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day); // Month is adjusted by subtracting 1 because JavaScript Date objects use a zero-based index for months (0 = January, 1 = February, etc.).
    const today = new Date();

    if (inputDate >= today) {
      return { dateBeforeToday: true }; // Angular uses this return value to determine the validity of the form control. If the validator returns an object, the form control is marked as invalid. If the validator returns null, the form control is considered valid.
    }

    return null;
  };
}