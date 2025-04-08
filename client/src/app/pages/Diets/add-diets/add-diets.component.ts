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

import { TemplateService } from '../../../services/template.service'; 





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
  templateService = inject(TemplateService); // Add template service


  templates: any[] = [];
  showTemplateSelector = false;
  loading = false;




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


// Method to open template selector and fetch templates
openTemplateSelector(): void {
  this.showTemplateSelector = true;
  this.loading = true;
  this.templates = [];
  
  this.templateService.fetchTemplates().subscribe({
    next: (response: any) => {
      console.log('Templates response:', response);
      
      // Handle different response formats
      if (response && response.data) {
        this.templates = response.data;
      } else if (Array.isArray(response)) {
        this.templates = response;
      } else if (response) {
        this.templates = [response];
      }
      
      this.loading = false;
    },
    error: (error) => {
      console.error('Error fetching templates:', error);
      this.loading = false;
      this.errorMessage = 'Failed to load templates';
    }
  });
}

// Close template selector
closeTemplateSelector(): void {
  this.showTemplateSelector = false;
}

// Format date for display
formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Select and apply template
selectTemplate(template: any): void {
  this.loading = true;
  
  // Fetch full template details if we only have summary info
  this.templateService.fetchTemplateById(template.id).subscribe({
    next: (templateData: any) => {
      const fullTemplate = templateData.data || templateData;
      
      // Set the diet name (append "copy" to avoid name collision)
      this.addclientDietsForm.get('name')?.setValue(fullTemplate.name + ' - Copy');
      
      // Clear existing days
      const daysArray = this.addclientDietsForm.get('dietDays') as FormArray;
      
      // Apply template data to form
      if (fullTemplate.days || fullTemplate.Days) {
        const templateDays = fullTemplate.days || fullTemplate.Days;
        
        // Map template days to form structure
        templateDays.forEach((day: any, dayIndex: number) => {
          if (dayIndex >= 7) return; // Only process up to 7 days
          
          const dayMeals = day.meals || day.Meals || [];
          
          // For each meal type, find the corresponding meal in the template
          const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Morning Snack', 'Afternoon Snack'];
          
          mealTypes.forEach((mealType, mealIndex) => {
            // Find the meal of this type
            const meal = dayMeals.find((m: any) => 
              (m.Type === mealType || m.type === mealType || 
               m.mealType === mealType || m.MealType === mealType)
            );
            
            if (meal) {
              // Set the meal content in the form
              const mealContent = meal.Meal || meal.meal || '';
              this.getDayMealControl(dayIndex, mealIndex).setValue(mealContent);
            }
          });
        });
      }
      
      this.loading = false;
      this.closeTemplateSelector();
      this.successMessage = "Template applied successfully!";
      
      // Clear the success message after a delay
      setTimeout(() => {
        this.successMessage = "";
      }, 3000);
    },
    error: (error) => {
      console.error('Error fetching template details:', error);
      this.loading = false;
      this.errorMessage = 'Failed to apply template';
      this.closeTemplateSelector();
    }
  });
}



  
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

  // Reset messages
  this.errorMessage = '';
  this.successMessage = '';
  
  const isTemplate = this.addclientDietsForm.controls['isTemplate'].value!;
  
  // Create the diet data object
  const dietData = {
    name: this.addclientDietsForm.controls['name'].value!,
    isTemplate: isTemplate,
    userDiets: [{ userId: this.clientId! }],
    days: this.addclientDietsForm.controls['dietDays'].value!.map((day: any) => ({
      dayName: day.name,
      meals: day.meals.map((meal: any) => ({
        meal: meal.meal,
        type: meal.mealType
      }))
    }))
  };

  // Create the main diet
  this.dietService.addDiet(dietData).subscribe({
    next: (diet: Diet) => {
      console.log("Diet added successfully.");
      this.dietid = diet.id;
      
      // If this is a template, also create a regular diet
      if (isTemplate) {
        const regularDietData = {
          ...dietData,
          name: dietData.name + " (Diet)",
          isTemplate: false
        };
        
        this.dietService.addDiet(regularDietData).subscribe({
          next: () => {
            this.successMessage = "Template and regular diet added successfully!";
            setTimeout(() => {
              this.dialogRef.close(true);
            }, 1500);
          },
          error: (error) => {
            console.error("Error creating regular diet:", error);
            this.successMessage = "Template created, but regular diet failed.";
          }
        });
      } else {
        this.successMessage = "Diet added successfully!";
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 1500);
      }
    },
    error: (error) => {
      // Error handling remains the same
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




