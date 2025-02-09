import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormErrorComponent } from "../../components/reactive-form-error/reactive-form-error.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationPatterns } from '../../validation/validation-patterns';
import { ValidationMessages } from '../../validation/validation-messages';
import { AccountService } from '../../services/account.service';
import { dateBeforeTodayValidator } from '../../validation/pastDateValidator';
import { DietTypesService } from '../../services/diet-types.service';
import { CommonModule, formatDate } from '@angular/common';
import { RegisterData } from '../../models/register.data';
import { HttpResponseError } from '../../models/http-error';
import { ErrorComponent } from "../../components/error/error.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormErrorComponent, ReactiveFormsModule, CommonModule, ErrorComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {


  private accountService = inject(AccountService);
  private dietTypeService = inject(DietTypesService);

  private phoneNumberExists = false;
  private emailExists = false;

  dietTypes = this.dietTypeService.dietTypes$;
  displayErrorOnControlDirty = true;


  ngOnInit(): void {
    this.dietTypeService.loadDietTypes().subscribe();

  }

  registerForm = new FormGroup({
    "fullName": new FormControl("", [
      Validators.pattern(ValidationPatterns.fullName),
      Validators.required,
    ]),

    "phoneNumber": new FormControl("", [
      Validators.pattern(ValidationPatterns.phoneNumber),
      Validators.required
    ]),

    "password": new FormControl("", [
      Validators.pattern(ValidationPatterns.strongPassword),
      Validators.required
    ]),

    "email": new FormControl("", [
      Validators.pattern(ValidationPatterns.email),
      Validators.required
    ]),

    "dateOfBirth": new FormControl("", [
      Validators.required,
      dateBeforeTodayValidator()
    ]),

    "height": new FormControl("", [
      Validators.pattern(ValidationPatterns.height),
      Validators.required
    ]),

    "gender": new FormControl("", [
      Validators.pattern(ValidationPatterns.gender),
      Validators.required
    ]),

    "dietType": new FormControl("", [
      Validators.required
    ]),
  })

  fullNameErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.fullName]
  ])

  phoneNumberErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.phoneNumber]
  ])

  passwordErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.strongPassword]
  ])

  emailErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.email]
  ])

  dateOfBirthErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["dateBeforeToday", ValidationMessages.dateOfBirth]
  ])

  heightErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.height]
  ])

  genderErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.gender]
  ])

  dietTypeErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.dietType]
  ])



  get phoneNumberExistsError() {
    return this.phoneNumberExists && !this.registerForm.controls.phoneNumber.dirty ? ValidationMessages.phoneNumberExists : "";
  }

  get emailExistsError() {
    return this.emailExists && this.registerForm.controls.email.dirty ? ValidationMessages.emailExists : "";
  }

  markAsDirtyIfUnselected(controlName: string) {
    const control = this.registerForm.get(controlName);
    if (control && control.value === '') {
      control.markAsDirty();
    }
  }



  register() {
    if (this.registerForm.valid) {
      
      if (!this.registerForm.dirty) {
        return;
      }

      const registerData: RegisterData = {
        dateOfBirth: this.registerForm.controls.dateOfBirth.value ?? "",
        dietTypeId: this.registerForm.controls.dietType.value ?? "",
        gender: this.registerForm.controls.gender.value ?? "",
        height: Number.parseFloat(this.registerForm.controls.height.value!) ?? 0,
        password: this.registerForm.controls.password.value ?? "",
        phoneNumber: this.registerForm.controls.phoneNumber.value ?? "",
        fullName: this.registerForm.controls.fullName.value ?? "",
        email: this.registerForm.controls.email.value ?? ""
      }

      this.accountService.register(registerData).subscribe({
        next: (user) => {
          // navigate to home
          console.log(user);
        },
        error: (error: HttpResponseError) => {
          for (const httpError of error.errors) {
            if (httpError.message == "Email already exists" ) {
                this.emailExists = true;
            }
            if (httpError.message == "Phone number already exists") {
                this.phoneNumberExists = true;
            }
          }
          this.registerForm.markAsPristine();
          console.log(error)
        }
      })
    }
    else {
      this.displayErrorOnControlDirty = false;
    }
  }
}
