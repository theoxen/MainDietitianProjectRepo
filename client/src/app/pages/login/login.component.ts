import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationPatterns } from '../../validation/validation-patterns';
import { ReactiveFormErrorComponent } from "../../components/reactive-form-error/reactive-form-error.component";
import { ValidationMessages } from '../../validation/validation-messages';
import { ErrorComponent } from "../../components/error/error.component";
import { AccountService } from '../../services/account.service';
import { LoginData } from '../../models/login-data';
import { PrimaryInputFieldComponent } from "../../components/primary-input-field/primary-input-field.component";
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { PageFooterComponent } from "../../components/page-footer/page-footer.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormErrorComponent, ErrorComponent, PrimaryInputFieldComponent, RouterLink, RouterLinkActive, NavBarComponent, PageFooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private accountService = inject(AccountService);
  private router = inject(Router);

  private wereCredentialsWrong = false;

  private toastr = inject(ToastrService);

  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  unauthorizedErrorMessage = ValidationMessages.unauthorized;

  loginForm = new FormGroup({
    "phoneNumber": new FormControl("", [
      Validators.pattern(ValidationPatterns.phoneNumber),
      Validators.required
    ]),
    "password": new FormControl("", [
      Validators.pattern(ValidationPatterns.strongPassword),
      Validators.required
    ])
  })


  phoneNumberErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.phoneNumber]
  ])

  passwordErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.strongPassword]
  ])


  get isUnAuthorizationMessageActive() {
    return this.wereCredentialsWrong && !this.loginForm.dirty
  }

  login() {
    if (this.loginForm.valid) {

      if (!this.loginForm.dirty) {
        return;
      }

      const loginData:LoginData={
        password:this.loginForm.controls.password.value ?? "",
        phoneNumber:this.loginForm.controls.phoneNumber.value ?? ""
      }

      this.accountService.login(loginData).subscribe({
        next:(user)=>{
          this.router.navigateByUrl("/");
          this.toastr.success("You have successfully logged in!");
        },
        error:(error)=>{
          // console.log(error)
          this.wereCredentialsWrong=true;
          this.loginForm.markAsPristine();
        }
      })

    }
    else {
      this.loginForm.markAllAsTouched();
    }
  }
}
