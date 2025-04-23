import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormErrorComponent } from "../../components/reactive-form-error/reactive-form-error.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationPatterns } from '../../validation/validation-patterns';
import { ValidationMessages } from '../../validation/validation-messages';
import { AccountService } from '../../services/account.service';
import { dateBeforeTodayValidator } from '../../validation/pastDateValidator';
import { DietTypesService } from '../../services/diet-types.service';
import { CommonModule } from '@angular/common';
import { RegisterData } from '../../models/register.data';
import { HttpResponseError } from '../../models/http-error';
import { ErrorComponent } from "../../components/error/error.component";
import { PrimaryInputFieldComponent } from '../../components/primary-input-field/primary-input-field.component';
import { PrimaryDropdownInputComponent } from "../../components/primary-dropdown-input/primary-dropdown-input.component";
import { DropdownItem } from '../../components/primary-dropdown-input/dropdown-item';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { PageFooterComponent } from "../../components/page-footer/page-footer.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormErrorComponent, ReactiveFormsModule, CommonModule, ErrorComponent, PrimaryInputFieldComponent, PrimaryDropdownInputComponent, NavBarComponent, PageFooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {


  private accountService = inject(AccountService);
  private dietTypeService = inject(DietTypesService);
  private toastr = inject(ToastrService);

  private phoneNumberExists = false;
  public emailExists = false;

  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  dietTypeDropdownOptions: DropdownItem<string, string>[] = [];
  genderDropdownOptions: DropdownItem<string, string>[] = [
    { value: "Male", displayedValue: "Male" },
    { value: "Female", displayedValue: "Female" }
  ];

  ngOnInit(): void {
    this.dietTypeService.loadDietTypes().subscribe({
      next: (dietTypes) => {
        this.dietTypeDropdownOptions = dietTypes.map(dietType => {
          return {
            value: dietType.id,
            displayedValue: dietType.name
          }
        })
      }
    });

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
      dateBeforeTodayValidator() // Function that takes an AbstractControl as an argument and returns either null if the control is valid or an object containing validation errors if the control is invalid.
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
    return this.emailExists && !this.registerForm.controls.email.dirty ? ValidationMessages.emailExists : "";
  }

  register() {
    if (this.registerForm.valid) {

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
          this.toastr.success("Registration of client was successful");
          this.registerForm.reset();
        },
        error: (error: HttpResponseError) => {
          this.emailExists = false;
          this.phoneNumberExists = false;
          for (const httpError of error.errors) {
            if (httpError.message == "Email already exists") {
              this.emailExists = true;
            }
            if (httpError.message == "Phone number already exists") {
              this.phoneNumberExists = true;
            }
          }
          this.registerForm.markAsPristine();
          // console.log(error);
        }
      })
    }
    else {
      this.registerForm.markAllAsTouched();
    }
  }
}
