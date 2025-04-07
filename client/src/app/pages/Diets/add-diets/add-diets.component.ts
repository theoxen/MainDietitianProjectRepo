import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DietService } from '../../../services/diet.service';
import { Router } from '@angular/router';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { CommonModule } from '@angular/common';
import { PrimaryInputFieldComponent } from '../../../components/primary-input-field/primary-input-field.component';
import { Diet } from '../../../models/diets/diet';
import { ClientManagementService } from '../../../services/client-management.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { DietToAdd } from '../../../models/diets/diets-to-add';



@Component({
  selector: 'add-diets',
  standalone: true,
  imports: [ReactiveFormsModule, PrimaryInputFieldComponent, CommonModule, NavBarComponent],
  templateUrl: './add-diets.component.html',
  styleUrls: ['./add-diets.component.css']
})



export class AddDietsComponent implements OnInit {
  cancel() {
    this.dialogRef.close(); // Just close the dialog without returning any result
  }


  

isConfirmationWindowVisible = false;
  clientId?: string;
  dietid: string = "";
  errorMessage: string = "";
  successMessage: string = "";
  diet!: Diet[];
  clientName!: string;


  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  
  dietService = inject(DietService);
  clientManagementService = inject(ClientManagementService);


  constructor(@Inject(MAT_DIALOG_DATA) public data: { clientId: string },
    private dialogRef: MatDialogRef<AddDietsComponent>) {}


    ngOnInit(): void {
      // Get the user ID from the data 
      this.clientId = this.data.clientId;
      
      this.clientManagementService.getClientDetails(this.clientId).subscribe({
        next: (fetchedClientDetails: ClientProfile) => {
          this.clientName = fetchedClientDetails.fullName;
        },
        error: (err) => {
          console.error('Error fetching client details:', err);
          this.clientName = 'Unknown Client'; // Fallback value in case of an error
          this.errorMessage = "Failed to load client details";
        }
      });
  
      // Initialize the form with default diet days
      this.initializeDietDaysForm();
    }


    addclientDietsForm = new FormGroup({
      "name": new FormControl("", [Validators.required]),
      "isTemplate": new FormControl(false),
      "dietDays": new FormArray([])
    });
  
    initializeDietDaysForm() {
      const daysArray = this.addclientDietsForm.get('dietDays') as FormArray;


// Add 7 days (for example)
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
dayNames.forEach(dayName => {
  daysArray.push(new FormGroup({
    name: new FormControl(dayName),
    meals: new FormArray([
      this.createMealFormGroup('Breakfast'),
      this.createMealFormGroup('Morning Snack'),
      this.createMealFormGroup('Lunch'),
      this.createMealFormGroup('Evening Snack'),
      this.createMealFormGroup('Dinner'),

    ])
  }));
});
}

createMealFormGroup(mealType: string) {
return new FormGroup({
  meal: new FormControl(''),
  mealType: new FormControl(mealType)
});
}

addDiets() {
  
  if (this.addclientDietsForm.invalid) {
    this.addclientDietsForm.markAllAsTouched();
    return;
  }

// Reset messages
this.errorMessage = '';
this.successMessage = '';

const DietsToAdd: DietToAdd = {
  name: this.addclientDietsForm.controls['name'].value!,
  isTemplate: this.addclientDietsForm.controls['isTemplate'].value!,
  userDiets: [{ userId: this.clientId! }],
  days: this.addclientDietsForm.controls['dietDays'].value!.map((day: any) => ({
    dayName: day.name,
    meals: day.meals.map((meal: any) => ({
      meal: meal.meal,
      type: meal.mealType
    }))
  })),
};

// Call service to add the diet
this.dietService.addDiet(DietsToAdd).subscribe({
  next: (diets: Diet) => {
    console.log("Diet added successfully.");
    this.dietid = diets.id;
    this.successMessage = "Diet added successfully!";
    
    // Close the dialog after a brief delay so the user sees the success message
    setTimeout(() => {
      this.dialogRef.close(true); // Return true to indicate successful addition
    }, 1500);
  },
  error: (error: any) => {
    this.errorMessage = "Error adding diet. Please try again.";
    console.error("Error adding diet:", error);
  }
});
}





  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }




  userIdErrorMessages = new Map<string, string>([
    ["required", "User ID is required."],
    ["pattern", "User ID must be a valid UUID."],
  ]);
  
isTemplateErrorMessages = new Map<string, string>([
  ["required", "Is Template is required."]])



  nameErrorMessages = new Map<string, string>([
    ["required", "Name is required."],
    ["pattern", "Name must be a valid string."],
  ]);

dietDaysErrorMessages = new Map<string, string>([
  ["required", "Diet Days is required."]])

  getDayMealControl(dayIndex: number, mealIndex: number): FormControl {
    const days = this.addclientDietsForm.get('dietDays') as FormArray;
    const day = days.at(dayIndex) as FormGroup;
    const meals = day.get('meals') as FormArray;
    return meals.at(mealIndex).get('meal') as FormControl;
  }



}




