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
  imports: [ReactiveFormsModule, PrimaryInputFieldComponent, ConfirmationWindowComponent, NavBarComponent, CommonModule],
  templateUrl: './edit-diets.component.html',
  styleUrls: ['./edit-diets.component.css'],
})
export class EditDietsComponent implements OnInit {
  cancel() {
    this.dialogRef.close(); // Close the dialog without saving changes
  }

  isConfirmationWindowVisible = false;
  clientName!: string;
  dietId?: string;
  errorMessage: string = "";
  successMessage: string = "";
  diets!: Diet[];
  userId!: string;
  dateCreatedString!: string;
  dateCreated!: Date;
  transformedDiets: { id: any; name: any; isTemplate: any }[] = [];
  filteredDiets: { id: any; name: any; isTemplate: any }[] = [];
  searchControl = new FormControl('');

  dietService = inject(DietService);
  clientManagementService = inject(ClientManagementService);

  clientDiets = new FormGroup({
    "name": new FormControl("", [Validators.required]),
    "isTemplate": new FormControl(false),
    "dietDays": new FormArray([])
  });

  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { dietId: string },
    private dialogRef: MatDialogRef<EditDietsComponent>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dietId = this.data.dietId;
    window.scrollTo(0, 0); // Scroll to the top of the page
    this.initializeDietDaysForm(); // Initialize the form structure first
    if (this.dietId) {
      this.fetchDietsForUser(this.dietId);
    }
  }

  fetchDietsForUser(dietId: string): void {
    this.dietService.fetchDietById(dietId).subscribe({
      next: (response: any) => {
        let fetchedDiet: Diet;
        
        // Handle different response formats
        if (response && response.data) {
          fetchedDiet = response.data;
        } else {
          fetchedDiet = response;
        }
        
        if (fetchedDiet) {
          this.dateCreated = new Date(fetchedDiet.dateCreated);
          this.dateCreatedString = this.dateCreated.toLocaleDateString();
          
          // Check if userDiets exists and has items
          if (fetchedDiet.userDiets && fetchedDiet.userDiets.length > 0) {
            const userId = fetchedDiet.userDiets[0].userId;
            this.userId = userId;
  
            this.clientManagementService.getClientDetails(userId).subscribe({
              next: (fetchedClientDetails: ClientProfile) => {
                this.clientName = fetchedClientDetails.fullName;
              },
              error: (error: any) => {
                this.errorMessage = "Error fetching client details. Please try again later.";
                console.error("Error fetching client details:", error);
              }
            });
          } else {
            this.clientName = "Unknown Client";
            console.error("No user diets found in the fetched diet");
          }
          
          // Normalize diet data structure
          this.normalizeDietData(fetchedDiet);
          
          // Populate the form
          this.populateForm(fetchedDiet);
          this.diets = [fetchedDiet];
        }
      },
      error: (error: any) => {
        this.errorMessage = "Error fetching diet. Please try again later.";
        console.error("Error fetching diet:", error);
      }
    });
  }


  normalizeDietData(diet: any): void {
    // Handle different property names for diet days
    if (!diet.dietDays && diet.Days) {
      diet.dietDays = diet.Days;
    } else if (!diet.dietDays && diet.days) {
      diet.dietDays = diet.days;
    } else if (!diet.dietDays) {
      diet.dietDays = [];
    }
  
    // Process each day and normalize meal structure
    diet.dietDays.forEach((day: any) => {
      if (!day.dietMeals && day.Meals) {
        day.dietMeals = day.Meals.map((meal: any) => ({
          id: meal.id || '',
          mealType: meal.Type || meal.mealType,
          meal: meal.Meal || meal.meal
        }));
      } else if (!day.dietMeals) {
        day.dietMeals = [];
      }
    });
  }


  initializeDietDaysForm() {
    const daysArray = this.clientDiets.get('dietDays') as FormArray;
    // Clear existing form array items first
    while (daysArray.length > 0) {
      daysArray.removeAt(0);
    }
  
    // Add 7 days
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    dayNames.forEach(dayName => {
      daysArray.push(new FormGroup({
        id: new FormControl(''),
        name: new FormControl(dayName),
        meals: new FormArray([
          this.createMealFormGroup('Breakfast'),      // Index 0
          this.createMealFormGroup('Lunch'),          // Index 1
          this.createMealFormGroup('Dinner'),         // Index 2
          this.createMealFormGroup('Morning Snack'),  // Index 3
          this.createMealFormGroup('Afternoon Snack') // Index 4
        ])
      }));
    });
  }

  createMealFormGroup(mealType: string) {
    return new FormGroup({
      id: new FormControl(''),
      meal: new FormControl(''),
      mealType: new FormControl(mealType)
    });
  }

  populateForm(diet: Diet): void {
    console.log('Populating form with diet:', diet);
    
    // Set basic values
    this.clientDiets.patchValue({
      name: diet.name,
      isTemplate: diet.isTemplate
    });
  
    // Get the days array from the diet
    const dietDays = diet.dietDays || [];
    const daysArray = this.clientDiets.get('dietDays') as FormArray;
  
    console.log('Diet days:', dietDays);
    
    // For each day in the diet, update the corresponding FormGroup
    dietDays.forEach((dietDay, dayIndex) => {
      if (dayIndex < daysArray.length) {
        const dayFormGroup = daysArray.at(dayIndex) as FormGroup;
        
        // Set the day ID
        dayFormGroup.get('id')?.setValue(dietDay.id);
        
        // Get meals for this day
        const dietMeals = dietDay.dietMeals || [];
        console.log(`Day ${dayIndex} meals:`, dietMeals);
        
        const mealsArray = dayFormGroup.get('meals') as FormArray;
        
        // Use the SAME order as when the form was created
        const mealTypes = ['Breakfast', 'Morning Snack', 'Lunch', 'Dinner', 'Afternoon Snack'];
        
        // Then populate with data from the diet
        if (dietMeals && dietMeals.length > 0) {
          mealTypes.forEach((mealType, typeIndex) => {
            const dietMeal = dietMeals.find(m => 
              m.mealType === mealType );
            
            if (dietMeal && typeIndex < mealsArray.length) {
              const mealFormGroup = mealsArray.at(typeIndex) as FormGroup;
              mealFormGroup.patchValue({
                id: dietMeal.id,
                meal: dietMeal.meal 
              });
              console.log(`Set meal ${mealType} value:`, dietMeal.meal );
            }
          });
        }
      }
    });
  }

  submitEditedDiets(): void {
    if (this.clientDiets.invalid) {
      this.clientDiets.markAllAsTouched();
      return;
    }

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    const EditedDietsToSubmit: DietToEdit = {
      id: this.dietId!,
      name: this.clientDiets.controls['name'].value!,
      isTemplate: this.clientDiets.controls['isTemplate'].value!,
      days: this.clientDiets.controls['dietDays'].value!.map((day: any) => ({
        id: day.id,
        dayName: day.name,
        meals: day.meals.map((meal: any) => ({
          meal: meal.meal,
          type: meal.mealType
        }))
      }))
    };

    // Call service to update the diet
    this.dietService.editDiet(EditedDietsToSubmit).subscribe({
      next: (diet: Diet) => {
        console.log("Diet updated successfully.");
        this.dietId = diet.id;
        this.successMessage = "Diet updated successfully!";
        
        // Close the dialog after a brief delay so the user sees the success message
        setTimeout(() => {
          this.dialogRef.close(true); // Return true to indicate successful update
        }, 1500);
      },
      error: (error: any) => {
        this.errorMessage = "Error updating diet. Please try again.";
        console.error("Error updating diet:", error);
      }
    });
  }

  getDayMealControl(dayIndex: number, mealIndex: number): FormControl {
    const days = this.clientDiets.get('dietDays') as FormArray;
    const day = days.at(dayIndex) as FormGroup;
    const meals = day.get('meals') as FormArray;
    return meals.at(mealIndex).get('meal') as FormControl;
  }

  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }

  handleDeleteConfirmation(result: boolean) {
    this.isConfirmationWindowVisible = false;
    if (result) {
      // Call service to delete the diet
      this.dietService.deleteDiet(this.dietId!).subscribe({
        next: () => {
          console.log("Diet deleted.");
          this.dialogRef.close(true); // Close the modal after successful deletion
        },
        error: (error: any) => {
          this.errorMessage = "Error deleting diet. Please try again.";
          console.error("Error deleting diet:", error);
        }
      });
    } else {
      console.log('Deletion cancelled.');
    }
  }

  nameErrorMessages = new Map<string, string>([
    ["required", "Name is required."],
    ["pattern", "Name must be a valid string."],
  ]);

  dietDaysErrorMessages = new Map<string, string>([
    ["required", "Diet Days is required."]
  ]);

  isTemplateErrorMessages = new Map<string, string>([
    ["required", "Is Template is required."]
  ]);
}