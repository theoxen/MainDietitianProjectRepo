import { Component, inject } from '@angular/core';
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { ValidationMessages } from '../../../validation/validation-messages';
import { HttpResponseError } from '../../../models/http-error';
import { AccountService } from '../../../services/account.service';
import { ErrorComponent } from "../../../components/error/error.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password-step-1',
  standalone: true,
  imports: [PrimaryInputFieldComponent, ErrorComponent, ReactiveFormsModule],
  templateUrl: './forgot-password-step-1.component.html',
  styleUrl: './forgot-password-step-1.component.css'
})
export class ForgotPasswordStep1Component {

  accountService = inject(AccountService);
  router = inject(Router);

  showErrorOnControlTouched = true;
  showErrorOnControlDirty = true;
  emailExists = true;
  isOtpValid = true;
  isOtpRequested = true;
  emailOrCodeDoesntExist = false;


  emailForm = new FormGroup({
    emailFormControl: new FormControl("", [
      Validators.pattern(ValidationPatterns.email),
      Validators.required
    ])
  });

  forgotPasswordForm = new FormGroup({
    email: this.emailForm.controls.emailFormControl,
    "otp": new FormControl("", [
      Validators.required,
      Validators.pattern(ValidationPatterns.otp)
    ]),
  });



  emailErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.email]
  ])

  otpErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.otp]
  ])


  get emailExistsError() {
    return !this.emailExists && !this.emailForm.controls.emailFormControl.dirty ? ValidationMessages.emailDoesNotExist : "";
  }

  get otpVerifiedError() {
    if (!this.isOtpRequested && !this.forgotPasswordForm.controls.otp.dirty) {
      return ValidationMessages.otpNotRequested;
    }

    else if (!this.isOtpValid && !this.forgotPasswordForm.controls.otp.dirty) {
      return ValidationMessages.invalidOtp;
    }

    return "";
  }

  sendOtp() {
    if (this.emailForm.controls.emailFormControl.valid && this.emailForm.controls.emailFormControl.value != null) {

      this.accountService.sendOtp(this.emailForm.controls.emailFormControl.value).subscribe({
        next: (otp) => {
          console.log(otp);
        },
        error: (error: HttpResponseError) => {
          this.emailExists = true;
          error.errors.forEach(error => {
            if (error.identifier === "EmailNotFound") {
              this.emailExists = false;
            }
          });

          this.emailForm.controls.emailFormControl.markAsPristine();
          console.log(error);
        }
      })
    }
    else {
      this.emailForm.controls.emailFormControl.markAllAsTouched();
      this.showErrorOnControlDirty = false;
    }
  }



  verifyOtp() {

    if (this.forgotPasswordForm.valid && this.forgotPasswordForm.controls.email.value != null && this.forgotPasswordForm.controls.otp.value != null) {

      this.accountService.verifyOtp(this.forgotPasswordForm.controls.email.value, this.forgotPasswordForm.controls.otp.value).subscribe({
        next: () => {
          // Store email and otp in session storage
          sessionStorage.setItem('email', this.forgotPasswordForm.controls.email.value!);
          sessionStorage.setItem('otp', this.forgotPasswordForm.controls.otp.value!);

          // Navigate to step-2 component
          this.router.navigate(['/users/forgot-password/change-password']);
        },
        error: (error: HttpResponseError) => {
          this.emailExists = true;
          this.isOtpValid = true;
          this.isOtpRequested = true;
          error.errors.forEach(error => {
            if (error.identifier === "EmailNotFound") {
              this.emailExists = false;
            }
            if (error.identifier === "OtpInvalid") {
              this.isOtpValid = false;
            }
            if (error.identifier === "OtpNotRequested") {
              this.isOtpRequested = false;
            }
          });

          this.forgotPasswordForm.markAsPristine();
        }
      });

    }
    else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

}
