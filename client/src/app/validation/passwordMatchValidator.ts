import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms";

export function passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl) => {
        const formGroup = control as FormGroup; // Cast the control to a FormGroup
        const password = formGroup.get('password');
        const confirmPassword = formGroup.get('confirmPassword');

        if (!password || !confirmPassword) {
            return null;
        }

        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };

        } else {
            if (confirmPassword.errors) {
                const { passwordMismatch, ...otherErrors } = confirmPassword.errors;
                if (Object.keys(otherErrors).length === 0) {
                    confirmPassword.setErrors(null);
                } else {
                    confirmPassword.setErrors(otherErrors);
                }
            } else {
                confirmPassword.setErrors(null);
            }
            return null;
        }

    }
}