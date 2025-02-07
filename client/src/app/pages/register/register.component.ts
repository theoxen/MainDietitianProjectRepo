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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormErrorComponent, ReactiveFormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit  {


  private accountService = inject(AccountService);
  private dietTypeService= inject(DietTypesService)

  dietTypes=this.dietTypeService.dietTypes$;

  displayErrorOnControlDirty = true;

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
    
    dateOfBirthErrorMessages = new Map<string, string>([
      ["required", ValidationMessages.required],
      ["pattern", ValidationMessages.dateOfBirth]
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

    ngOnInit(): void {
      this.dietTypeService.loadDietTypes().subscribe();

    }

    markAsDirtyIfUnselected(controlName: string) {
      const control = this.registerForm.get(controlName);
      if (control && control.value === '') {
        control.markAsDirty();
      }
    }

    register(){

      if (this.registerForm.valid) {

        const registerData:RegisterData={
          dateOfBirth:this.registerForm.controls.dateOfBirth.value ?? "",
          dietTypeId:this.registerForm.controls.dietType.value ?? "",
          gender:this.registerForm.controls.gender.value ?? "",
          height:Number.parseFloat(this.registerForm.controls.height.value!) ?? 0,
          password:this.registerForm.controls.password.value ?? "",
          phoneNumber:this.registerForm.controls.phoneNumber.value ?? "",
          fullName:this.registerForm.controls.fullName.value ?? "",
        }

        this.accountService.register(registerData).subscribe({
          next:(user)=>{
            // navigate to home
            console.log(user);
          },
          error:(error)=>{
            console.log(error)
          }
        })
      }
      else {
        this.displayErrorOnControlDirty = false;
      }
    }
}
