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
  imports: [ReactiveFormsModule, PrimaryInputFieldComponent, NavBarComponent],
  templateUrl: './add-diets.component.html',
  styleUrls: ['./add-diets.component.css']
})
export class AddDietsComponent implements OnInit {
cancel() {
throw new Error('Method not implemented.');
}
  

  isConfirmationWindowVisible = false;
    clientId?: string;
    dietid: string = "";
    errorMessage: string = "";
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
              next: (fetchedClientDetails:ClientProfile) =>{
                this.clientName = fetchedClientDetails.fullName;
              },
              error: (err) => {
                console.error('Error fetching client details:', err);
                this.clientName = 'Unknown Client'; // Fallback value in case of an error
              }
            })

  }


 addclientDietsForm = new FormGroup({
    "name": new FormControl("", [Validators.required]),
    "isTemplate": new FormControl(false),
    "dietDays": new FormArray([]),
    "userId": new FormControl(this.clientId, [Validators.required]),
  })

  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }


  addDiets() {
    if (this.addclientDietsForm.invalid) {
      this.addclientDietsForm.markAllAsTouched();
      return;
    }
    const DietsToAdd: DietToAdd = { // Assigning the values of the controls to the object to be sent to the service
      name: this.addclientDietsForm.controls['name'].value!,
      isTemplate: this.addclientDietsForm.controls['isTemplate'].value!,
      dietDays: this.addclientDietsForm.controls['dietDays'].value!.map((day: any) => ({
        id: day.id,
        dayName: day.name,
        dietMeals: day.meals.map((meal: any) => ({
          id: meal.id,
          meal: meal.meal,
          mealType: meal.mealType,
        }))
      })),
      userId: this.addclientDietsForm.controls['userId'].value!,
    }

    // Call service to add the diet
    this.dietService.addDiet(DietsToAdd).subscribe({
      next: (diets: Diet) => {
        console.log("Diet added.");
        this.dietid = diets.id;
        // this.addclientMetricsForm.reset();  // Clear the form after adding metrics
        this.dialogRef.close(); // Close the modal after successful addition

        
      },
      error: (error:any) => {
        //this.errorMessage = "Error adding metrics. Please try again later.";
        console.error("Error adding diet."); // Log error to the console
      }
    })

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


}




