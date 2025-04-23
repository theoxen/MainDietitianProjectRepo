import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { DietService } from '../../../services/diet.service';
import { TemplatesService } from '../../../services/templates.service';
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
  imports: [ReactiveFormsModule, FormsModule ,PrimaryInputFieldComponent, CommonModule, NavBarComponent],
  templateUrl: './add-diets.component.html',
  styleUrls: ['./add-diets.component.css']
})



export class AddDietsComponent implements OnInit {
  cancel() {
    this.dialogRef.close(); // Just close the dialog without returning any result
  }

  showTemplateSelector = false;
  availableTemplates: any[] = [];
  filteredTemplates: any[] = [];
  templateSearchTerm = '';
  

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
  templatesService = inject(TemplatesService);

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

      this.fetchAvailableTemplates();
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
  meal: new FormControl(''),
  mealType: new FormControl(mealType)
});
}

addDiets() {
  if (this.addclientDietsForm.invalid) {
    this.addclientDietsForm.markAllAsTouched();
    return;
  }

  // Reset messages at the beginning
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
    }))
  };

  // Call service to add the diet
  this.dietService.addDiet(DietsToAdd).subscribe({
    next: (diet: Diet) => {
      // console.log("Diet added successfully.");
      this.dietid = diet.id;
      this.successMessage = "Diet added successfully!";
      
      // Close the dialog after a brief delay
      setTimeout(() => {
        this.dialogRef.close(true);
      }, 1500);
    },
    error: (error: any) => {
      console.error("Error adding diet:", error);
      
      // Check for the specific diet already exists error
      if (error?.error?.errors && Array.isArray(error.error.errors)) {
        const dietExistsError = error.error.errors.find(
          (err: any) => err.identifier === 'DietAlreadyExists'
        );
        
        if (dietExistsError) {
          this.errorMessage = "Diet with this name already exists. Change diet name";
        } else {
          this.errorMessage = "Failed to add diet. Please try again.";
        }
      } else {
        this.errorMessage = "An error occurred. Please try again.";
      }
      
      // Make sure the success message is cleared when there's an error
      this.successMessage = "";
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

    // Method to fetch available templates
    fetchAvailableTemplates(): void {
      this.templatesService.fetchTemplates().subscribe({
        next: (diets: any) => {
          // Filter to get only template diets
          this.availableTemplates = diets
            .filter((diet: any) => diet.isTemplate === true)
            .map((diet: any) => ({
              id: diet.id,
              name: diet.name,
              date: this.formatDate(diet.dateCreated || diet.date),
              fullData: diet
            }));
          
          this.filteredTemplates = [...this.availableTemplates];
        },
        error: (err) => {
          console.error('Error fetching templates:', err);
          this.errorMessage = "Failed to load templates";
        }
      });
    }
    
    // Format date for displaying in template list
    formatDate(date: string | Date): string {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString();
    }
    
    // Show template selection UI
    showTemplateSelection(): void {
      this.showTemplateSelector = true;
      this.filteredTemplates = [...this.availableTemplates];
    }
    
    // Cancel template selection
    cancelTemplateSelection(): void {
      this.showTemplateSelector = false;
      this.templateSearchTerm = '';
    }
    
    // Filter templates based on search term
    filterTemplates(): void {
      if (!this.templateSearchTerm.trim()) {
        this.filteredTemplates = [...this.availableTemplates];
        return;
      }
      
      const term = this.templateSearchTerm.toLowerCase().trim();
      this.filteredTemplates = this.availableTemplates.filter(template => 
        template.name.toLowerCase().includes(term)
      );
    }
    
    selectTemplate(template: any): void {
      // console.log('Selected template:', template);
      
      // Set the diet name
      this.addclientDietsForm.get('name')?.setValue(template.name + ' (Copy)');
      
      // Fetch the complete template data
      this.dietService.fetchDietById(template.id).subscribe({
        next: (response) => {
          // console.log('Complete template data from API:', response);
          
          if (response && response.data) {
            const dietData = response.data;
            
            // Get days from the template data
            const days = dietData.days || dietData.Days || [];
            // console.log('Days from template:', days);
            
            if (days.length > 0) {
              // Get the days FormArray from the form
              const daysArray = this.addclientDietsForm.get('dietDays') as FormArray;
              
              // Define type for meal types
              type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Morning Snack' | 'Afternoon Snack';
              
              // This mapping reflects how the HTML accesses the meal controls
              const mealTypeToIndex: Record<MealType, number> = {
                'Breakfast': 0,
                'Lunch': 1, 
                'Dinner': 2,
                'Morning Snack': 3,
                'Afternoon Snack': 4
              };
              
              // For each day in the form
              for (let i = 0; i < daysArray.length; i++) {
                const dayGroup = daysArray.at(i) as FormGroup;
                const dayName = dayGroup.get('name')?.value;
                
                // Find the matching day in the template
                const matchingDay = days.find((d: { dayName: any; DayName: any; name: any; Name: any; }) => 
                  (d.dayName === dayName) || (d.DayName === dayName) || 
                  (d.name === dayName) || (d.Name === dayName)
                );
                
                if (matchingDay) {
                  // console.log(`Found matching day for ${dayName}:`, matchingDay);
                  
                  // Get the meals from the matching day
                  const templateMeals = matchingDay.meals || matchingDay.Meals || [];
                  // console.log(`Meals for ${dayName}:`, templateMeals);
                  
                  // Get the meals FormArray for this day
                  const mealsArray = dayGroup.get('meals') as FormArray;
                  
                  // Process each meal in the template
                  templateMeals.forEach((meal: { mealType: any; MealType: any; type: any; Type: any; meal: any; Meal: any; }) => {
                    const mealType = meal.mealType || meal.MealType || meal.type || meal.Type;
                    const mealContent = meal.meal || meal.Meal || '';
                    
                    // Get the correct form control index for this meal type
                    // Use type assertion to tell TypeScript this is a valid MealType
                    if (mealType in mealTypeToIndex) {
                      const formIndex = mealTypeToIndex[mealType as MealType];
                      
                      if (formIndex !== undefined && formIndex < mealsArray.length) {
                        // Set the meal content in the correct form control
                        mealsArray.at(formIndex).get('meal')?.setValue(mealContent);
                        // console.log(`Set ${dayName} ${mealType} to: ${mealContent}`);
                      }
                    }
                  });
                }
              }
              
              this.successMessage = "Template applied successfully!";
            } else {
              this.errorMessage = "The selected template doesn't contain any days or meals";
            }
          } else {
            this.errorMessage = "Failed to load template data";
          }
          
          this.showTemplateSelector = false;
          setTimeout(() => {
            this.successMessage = "";
            this.errorMessage = "";
          }, 3000);
        },
        error: (error) => {
          console.error('Error fetching template data:', error);
          this.errorMessage = "Failed to load template data";
          this.showTemplateSelector = false;
          setTimeout(() => {
            this.errorMessage = "";
          }, 3000);
        }
      });
    }
}




