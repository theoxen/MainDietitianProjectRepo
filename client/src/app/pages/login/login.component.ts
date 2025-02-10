import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationPatterns } from '../../validation/validation-patterns';
import { ReactiveFormErrorComponent } from "../../components/reactive-form-error/reactive-form-error.component";
import { ValidationMessages } from '../../validation/validation-messages';
import { ErrorComponent } from "../../components/error/error.component";
import { AccountService } from '../../services/account.service';
import { LoginData } from '../../models/login-data';
import {MatInputModule} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PrimaryInputFieldComponent } from "../../components/primary-input-field/primary-input-field.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ReactiveFormErrorComponent, ErrorComponent, MatInputModule, MatFormFieldModule, PrimaryInputFieldComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private accountService = inject(AccountService);

  private wereCredentialsWrong = false;

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
          // navigate to home
          console.log(user);
        },
        error:(error)=>{
          console.log(error)
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
