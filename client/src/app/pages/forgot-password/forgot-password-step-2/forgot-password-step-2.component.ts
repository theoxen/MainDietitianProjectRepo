import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { passwordMatchValidator } from '../../../validation/passwordMatchValidator';
import { AccountService } from '../../../services/account.service';
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { ValidationMessages } from '../../../validation/validation-messages';

@Component({
  selector: 'app-forgot-password-step-2',
  standalone: true,
  imports: [ReactiveFormsModule, PrimaryInputFieldComponent],
  templateUrl: './forgot-password-step-2.component.html',
  styleUrl: './forgot-password-step-2.component.css'
})
export class ForgotPasswordStep2Component implements OnInit {
  email: string | null = null;
  otp: string | null = null;
  timeoutId: any;
  showErrorOnControlTouched: boolean = true;
  showErrorOnControlDirty: boolean = true;

  router = inject(Router);
  accountService = inject(AccountService);

  ngOnInit(): void {
    this.email = sessionStorage.getItem('email');
    this.otp = sessionStorage.getItem('otp');

    // Set a timeout to remove email and otp from session storage after 5 minutes
    this.timeoutId = setTimeout(() => {
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('otp');
      this.router.navigate(['']); // Redirect to forgot password step 1 page after expiration
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
  }

  ngOnDestroy(): void {
    // Clear the timeout if the component is destroyed to prevent memory leaks
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('otp');
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


  changePassword() {
    console.log(this.changePasswordForm.controls.password.value, this.email, this.otp);
    if (this.changePasswordForm.valid && this.changePasswordForm.controls.password.value && this.email && this.otp) {
      this.accountService.changePassword(this.email, this.otp, this.changePasswordForm.controls.password.value).subscribe({
        next: () => {
          sessionStorage.removeItem('email');
          sessionStorage.removeItem('otp');
          clearTimeout(this.timeoutId);
          this.router.navigate(['']); // TODO: NAVIGATE TO HOME PAGE
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

}
