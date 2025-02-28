import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { passwordMatchValidator } from '../../../validation/passwordMatchValidator';
import { AccountService } from '../../../services/account.service';
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { ValidationMessages } from '../../../validation/validation-messages';
import { ErrorComponent } from "../../../components/error/error.component";
import { HttpResponseError } from '../../../models/http-error';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-forgot-password-step-2',
  standalone: true,
  imports: [ReactiveFormsModule, PrimaryInputFieldComponent, ErrorComponent, NavBarComponent],
  templateUrl: './forgot-password-step-2.component.html',
  styleUrl: './forgot-password-step-2.component.css'
})
export class ForgotPasswordStep2Component implements OnInit {
  email: string | null = null;
  otp: string | null = null;
  timeoutId: any;
  showErrorOnControlTouched: boolean = true;
  showErrorOnControlDirty: boolean = true;
  isOtpRequested = true;
  isOtpValid = true;
  emailExists = true;

  router = inject(Router);
  accountService = inject(AccountService);

  ngOnInit(): void {
    this.email = sessionStorage.getItem('email');
    this.otp = sessionStorage.getItem('otp');

    // TODO: UNCOMMENT THIS 
    // if (!this.email || !this.otp) {
    //   this.router.navigate(['users/forgot-password']); // Redirect to forgot password step 1 page if email or otp is missing
    //   this.changePasswordForm.disable(); // Disable the form if email or otp is missing
    // }

    // // Set a timeout to remove email and otp from session storage after 5 minutes
    // this.timeoutId = setTimeout(() => {
    //   sessionStorage.removeItem('email');
    //   sessionStorage.removeItem('otp');
    //   this.router.navigate(['users/forgot-password']); // Redirect to forgot password step 1 page after expiration
    // }, 5 * 60 * 1000); // 5 minutes in milliseconds
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('otp');

    // Clear the timeout if the component is destroyed to prevent memory leaks
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  changePasswordForm = new FormGroup({
    password: new FormControl("", [
      Validators.required,
      Validators.pattern(ValidationPatterns.strongPassword)
    ]),
    confirmPassword: new FormControl("", [
      Validators.required
    ])
  }, { validators: passwordMatchValidator() });


  passwordErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.strongPassword]
  ])

  confirmPasswordErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["passwordMismatch", ValidationMessages.passwordMismatch]
  ])

  get emailOrOtpIsMissingError(): string {
    return !this.email || !this.otp ? ValidationMessages.emailOrOtpMissing : "";
  }

  get cacheValidationError(): string {
    if (!this.isOtpRequested) {
      return "*OTP has expired, please head to the previous page and request a new one";
    }
    else if (!this.isOtpValid) {
      return "*Invalid OTP, please head to the previous page and request a new one";
    } else if (!this.emailExists) {
      return "*Email does not exist, please head to the previous page and enter a valid email";
    }
    else {
      return "";
    }

  }

  changePassword() {
    if (this.changePasswordForm.valid && this.changePasswordForm.controls.password.value && this.email && this.otp) {
      this.accountService.changePassword(this.email, this.otp, this.changePasswordForm.controls.password.value).subscribe({
        next: () => {
          sessionStorage.removeItem('email');
          sessionStorage.removeItem('otp');
          clearTimeout(this.timeoutId);
          this.router.navigate(['users/login']);
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
        }
      });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

}
