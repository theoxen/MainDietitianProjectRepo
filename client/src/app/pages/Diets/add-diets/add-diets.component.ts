import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
      console.log("Diet added successfully.");
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
    
    // Select and apply a template to the diet form
selectTemplate(template: any): void {
  const templateData = template.fullData;
  
  // Set the basic form fields
  this.addclientDietsForm.get('name')?.setValue(templateData.name + ' (Copy)');
  
  // Get the days array from the form
  const daysArray = this.addclientDietsForm.get('dietDays') as FormArray;
  
  // Get the days from the template
  const templateDays = templateData.Days || templateData.days || templateData.dietDays || [];
  
  // Populate each day's meals from the template
  if (templateDays.length > 0) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    dayNames.forEach((dayName, dayIndex) => {
      // Find the corresponding day in the template
      const templateDay = templateDays.find((d: any) => {
        const name = d.dayName || d.DayName;
        return name === dayName;
      });
      
      if (templateDay && dayIndex < daysArray.length) {
        const dayFormGroup = daysArray.at(dayIndex) as FormGroup;
        const mealsArray = dayFormGroup.get('meals') as FormArray;
        
        const mealTypeMap: Record<string, number> = {
          'Breakfast': 0,
          'Lunch': 1,
          'Dinner': 2,
          'Morning Snack': 3,
          'Afternoon Snack': 4
        };
        
        // Get meals from the template day
        const templateMeals = templateDay.Meals || templateDay.meals || templateDay.dietMeals || [];
        
        // For each meal type, find and set the value if it exists
        templateMeals.forEach((meal: any) => {
          const mealType = meal.Type || meal.type || meal.mealType || '';
          const mealContent = meal.Meal || meal.meal || '';
          
          // Check if the meal type exists in our mapping before using it
          if (mealType in mealTypeMap) {
            const formIndex = mealTypeMap[mealType as keyof typeof mealTypeMap];
            if (formIndex !== undefined && formIndex < mealsArray.length) {
              const mealControl = mealsArray.at(formIndex).get('meal') as FormControl;
              mealControl.setValue(mealContent);
            }
          }
        });
      }
    });
  }
  
  // Close template selector and show success message
  this.showTemplateSelector = false;
  this.successMessage = "Template applied successfully!";
  
  // Clear success message after delay
  setTimeout(() => {
    this.successMessage = "";
  }, 3000);
}


}




