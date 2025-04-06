import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from '../../../components/primary-input-field/primary-input-field.component';
import { ConfirmationWindowComponent } from '../../../components/confirmation-window/confirmation-window.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { ClientManagementService } from '../../../services/client-management.service';
import { Diet } from '../../../models/diets/diet';
import { DietToEdit } from '../../../models/diets/diets-to-edit';


@Component({
  selector: 'edit-diets',
  standalone: true,
  imports: [ReactiveFormsModule, PrimaryInputFieldComponent, ConfirmationWindowComponent, NavBarComponent],
  templateUrl: './edit-diets.component.html',
  styleUrls: ['./edit-diets.component.css'],
})


export class EditDietsComponent implements OnInit {
cancel() {
throw new Error('Method not implemented.');
}

  
  isConfirmationWindowVisible = false;
  clientName!: string;
  dietId?: string;
  errorMessage: string = "";
  diets!: Diet[];
  userId!:string;
  dateCreatedString!:string;
  dateCreated!:Date;
  transformedDiets: { id: any; name: any; isTemplate: any }[] = [];
  filteredDiets: { id: any; name: any; isTemplate: any }[] = [];
  searchControl = new FormControl('');

  dietService = inject(DietService);
  clientManagementService = inject(ClientManagementService);

  clientDiets = new FormGroup({
    "name": new FormControl("", [Validators.required]),
    "isTemplate": new FormControl(false),
    "dietDays": new FormArray([])
  })

  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;
  location: any;


  constructor(@Inject(MAT_DIALOG_DATA) public data: { dietId: string },
  private dialogRef: MatDialogRef<EditDietsComponent>,
  private router: Router) {}



  ngOnInit(): void {
    this.dietId = this.data.dietId;
    window.scrollTo(0, 0); // Scroll to the top of the page
    if (this.dietId) {
      this.fetchDietsForUser(this.dietId);
    }
}


fetchDietsForUser(dietId: string): void {
    this.dietService.fetchDietById(dietId).subscribe({
      next: (fetchedDiet:Diet) => {
        if (fetchedDiet) {
          this.dateCreated = new Date(fetchedDiet.dateCreated);
          this.dateCreatedString = this.dateCreated.toLocaleDateString();
          const userId = fetchedDiet.userDiets[0].userId; ////TO CHECK
          this.userId = fetchedDiet.userDiets[0].userId;  ////TO CHECK

          this.clientManagementService.getClientDetails(userId).subscribe({
            next: (fetchedClientDetails: ClientProfile) => {
              this.clientName = fetchedClientDetails.fullName;
            },
            error: (error: any) => {
              this.errorMessage = "Error fetching client details. Please try again later.";
              console.error("Error fetching client details:", error);
            }
          });
          this.populateForm(fetchedDiet);
        }
        this.diets = [fetchedDiet];
        this.filteredDiets = this.transformedDiets;
      },
      error: (error: any) => {
        this.errorMessage = "Error fetching metrics. Please try again later.";
        console.error("Error fetching metrics:", error);
      }
    });
}


 populateForm(diet: Diet): void {
    this.clientDiets.patchValue({
      name: diet.name,
      isTemplate: diet.isTemplate
    });
  }





   submitEditedDiets(): void {
      if (!this.clientDiets.dirty) {
        
        return;
      }
      const EditedDietsToSubmit: DietToEdit = { // Assigning the values of the controls to the object to be sent to the service

        id: this.dietId!,
        name: this.clientDiets.controls['name'].value!,
        isTemplate: this.clientDiets.controls['isTemplate'].value!,
        dietDays: this.clientDiets.controls['dietDays'].value!.map((day: any) => ({
          id: day.id,
          dayName: day.name,
          dietMeals: day.meals.map((meal: any) => ({
            id: meal.id,
            meal: meal.meal,
            mealType: meal.mealType,
          }))
        }))
      };
      
  
      // Call service to add the metrics
      this.dietService.editDiet(EditedDietsToSubmit).subscribe({
        next: (diets: Diet) => {
          console.log("Metrics Edited.");
          this.dietId = diets.id;
          this.dialogRef.close(); // Close the modal after successful submission
        },
        error: (error:any) => {
          //this.errorMessage = "Error adding diets. Please try again later.";
          console.error("Error adding diets."); // Log error to the console
        }
      })
  
    }



    openConfirmationWindow() {
      this.isConfirmationWindowVisible = true;
    }



    handleDeleteConfirmation(result: boolean) {
      this.isConfirmationWindowVisible = false;
      if (result) {
        // Call service to delete the metrics
        // IF WE WANTED TO MANUALLY SUBMIT THE FORM AFTER THE CONFIRMATION WINDOW WE WOULD DO this.onSubmit(); 
        this.dietService.deleteDiet(this.dietId!).subscribe({
          next: () => {
            console.log("Diet deleted.");
            this.dialogRef.close(); // Close the modal after successful deletion
          }
        });
      } else {
        console.log('Cancelled.');
      }
    }

  }

    // bodyWeightErrorMessages = new Map<string, string>([
    //   ["required", "Bodyweight is required"],
    //   ["pattern", "Invalid bodyweight format"],
    //   ["maxTwoDecimalPlaces", "Bodyweight can have a maximum of two decimal places"]
    // ]);
  
    // fatMassErrorMessages = new Map<string, string>([
    //   ["required", "Fat mass is required"],
    //   ["pattern", "Invalid fat mass format"],
    //   ["min", "Fat mass cannot be less than 0"],
    //   ["max", "Fat mass cannot be more than 100"],
    //   ["maxTwoDecimalPlaces", "Fat mass can have a maximum of two decimal places"]
    // ]);
  
    // muscleMassErrorMessages = new Map<string, string>([
    //   ["required", "Muscle mass is required"],
    //   ["pattern", "Invalid muscle mass format"],
    //   ["maxTwoDecimalPlaces", "Muscle mass can have a maximum of two decimal places"]
    // ]);

  
