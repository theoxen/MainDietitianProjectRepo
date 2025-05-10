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


// Component decorator defining metadata for the AddDiets component
// This component is standalone with its own imports and doesn't rely on NgModule
@Component({
  selector: 'add-diets',  // HTML selector used to embed this component
  standalone: true,       // Modern Angular pattern - no need for NgModule declarations
  imports: [ReactiveFormsModule, FormsModule ,PrimaryInputFieldComponent, CommonModule, NavBarComponent], // Required dependencies
  templateUrl: './add-diets.component.html',  // External HTML template
  styleUrls: ['./add-diets.component.css']    // External CSS styles
})



export class AddDietsComponent implements OnInit {
  // Method to close the dialog without saving changes
  cancel() {
    this.dialogRef.close(); // Just close the dialog without returning any result
  }

  // Properties for handling diet templates
  showTemplateSelector = false;     // Controls visibility of template selection UI
  availableTemplates: any[] = [];   // Stores all available templates from the server
  filteredTemplates: any[] = [];    // Stores templates filtered by search term
  templateSearchTerm = '';          // For template search functionality
  

  // UI control and state properties
  isConfirmationWindowVisible = false;  // Controls confirmation dialog visibility
  clientId?: string;                    // ID of the client for whom the diet is being created
  dietid: string = "";                  // Stores ID of created diet
  errorMessage: string = "";            // Displays error messages to user
  successMessage: string = "";          // Displays success messages to user
  diet!: Diet[];                        // Stores diet data
  clientName!: string;                  // Displays client name in the UI


  // Form validation display settings
  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  
  // Services injected for data operations
  dietService = inject(DietService);                      // Manages diet CRUD operations
  clientManagementService = inject(ClientManagementService); // For client data
  templatesService = inject(TemplatesService);            // For diet templates

  // Constructor - uses dependency injection pattern
  // MAT_DIALOG_DATA provides data from the component that opened this dialog
  constructor(@Inject(MAT_DIALOG_DATA) public data: { clientId: string },
    private dialogRef: MatDialogRef<AddDietsComponent>) {}


    // Component initialization logic
    ngOnInit(): void {
      // Get the user ID from the data passed to the dialog
      this.clientId = this.data.clientId;
      
      // Fetch client details to display client name
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

      // Load available diet templates
      this.fetchAvailableTemplates();
    }


    // Main form definition using FormGroup and FormControl
    // This reactive form handles diet creation data
    addclientDietsForm = new FormGroup({
      "name": new FormControl("", [Validators.required]),  // Diet name with validation
      "isTemplate": new FormControl(false),                // Flag to save as template for reuse
      "dietDays": new FormArray([])                        // Dynamic array of diet days
    });
  
    // Sets up the initial form structure with 7 days of the week
    // Each day contains 5 meals with default meal types
    initializeDietDaysForm() {
      const daysArray = this.addclientDietsForm.get('dietDays') as FormArray;


    // Add 7 days with standard day names
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

// Helper method to create a meal form group with predefined structure
// Each meal has its content and type (breakfast, lunch, etc.)
createMealFormGroup(mealType: string) {
return new FormGroup({
  meal: new FormControl(''),       // The actual meal content/description
  mealType: new FormControl(mealType)  // The type of meal (fixed value)
});
}

// Main form submission method - processes form data and sends to API
addDiets() {
  // Validate form before submission
  if (this.addclientDietsForm.invalid) {
    this.addclientDietsForm.markAllAsTouched();  // Trigger validation UI
    return;
  }

  // Reset messages at the beginning
  this.errorMessage = '';
  this.successMessage = '';

  // Transform form data to API expected format
  const DietsToAdd: DietToAdd = {
    name: this.addclientDietsForm.controls['name'].value!,
    isTemplate: this.addclientDietsForm.controls['isTemplate'].value!,
    userDiets: [{ userId: this.clientId! }],  // Associate diet with client
    days: this.addclientDietsForm.controls['dietDays'].value!.map((day: any) => ({
      dayName: day.name,
      meals: day.meals.map((meal: any) => ({
        meal: meal.meal,    // Meal content
        type: meal.mealType // Meal type
      }))
    }))
  };

  // Call service to add the diet to the backend
  this.dietService.addDiet(DietsToAdd).subscribe({
    next: (diet: Diet) => {
      // Success handler - diet created successfully
      this.dietid = diet.id;
      this.successMessage = "Diet added successfully!";
      
      // Close the dialog after a brief delay
      setTimeout(() => {
        this.dialogRef.close(true); // Return success to caller
      }, 1500);
    },
    error: (error: any) => {
      console.error("Error adding diet:", error);
      
      // Special handling for diet name uniqueness constraint
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

  // Show confirmation dialog before finalizing action
  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }


  // Validation error messages for form fields
  // Using maps to store error code -> error message mappings
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

  // Helper method to access nested form controls
  // Provides easy access to specific meal inputs by day and meal indexes
  getDayMealControl(dayIndex: number, mealIndex: number): FormControl {
    const days = this.addclientDietsForm.get('dietDays') as FormArray;
    const day = days.at(dayIndex) as FormGroup;
    const meals = day.get('meals') as FormArray;
    return meals.at(mealIndex).get('meal') as FormControl;
  }

    // Fetch available diet templates from server
    fetchAvailableTemplates(): void {
      this.templatesService.fetchTemplates().subscribe({
        next: (diets: any) => {
          // Filter to get only template diets and transform response format
          this.availableTemplates = diets
            .filter((diet: any) => diet.isTemplate === true)
            .map((diet: any) => ({
              id: diet.id,
              name: diet.name,
              date: this.formatDate(diet.dateCreated || diet.date),
              fullData: diet  // Keep original data for later use
            }));
          
          this.filteredTemplates = [...this.availableTemplates]; // Initialize filtered list with all templates
        },
        error: (err) => {
          console.error('Error fetching templates:', err);
          this.errorMessage = "Failed to load templates";
        }
      });
    }
    
    // Format date consistently for template list display
    formatDate(date: string | Date): string {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString();
    }
    
    // Toggle visibility of template selection UI
    showTemplateSelection(): void {
      this.showTemplateSelector = true;
      this.filteredTemplates = [...this.availableTemplates]; // Reset filters
    }
    
    // Close template selection UI without selecting a template
    cancelTemplateSelection(): void {
      this.showTemplateSelector = false;
      this.templateSearchTerm = '';
    }
    
    // Search functionality for templates
    // Filters templates based on user input
    filterTemplates(): void {
      if (!this.templateSearchTerm.trim()) {
        this.filteredTemplates = [...this.availableTemplates]; // Show all if no search term
        return;
      }
      
      const term = this.templateSearchTerm.toLowerCase().trim();
      this.filteredTemplates = this.availableTemplates.filter(template => 
        template.name.toLowerCase().includes(term)
      );
    }
    
    // Apply selected template to the current diet form
    selectTemplate(template: any): void {
      // Set the diet name (with copy indicator)
      this.addclientDietsForm.get('name')?.setValue(template.name + ' (Copy)');
      
      // Fetch complete template data with all details
      this.dietService.fetchDietById(template.id).subscribe({
        next: (response) => {
          if (response && response.data) {
            const dietData = response.data;
            
            // Get days from the template data (handle different API response formats)
            const days = dietData.days || dietData.Days || [];
            
            if (days.length > 0) {
              // Get the days FormArray from the form
              const daysArray = this.addclientDietsForm.get('dietDays') as FormArray;
              
              // Define type for meal types
              type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Morning Snack' | 'Afternoon Snack';
              
              // Map meal types to indexes in the form array
              // This is critical for matching template meals to form structure
              const mealTypeToIndex: Record<MealType, number> = {
                'Breakfast': 0,
                'Lunch': 1, 
                'Dinner': 2,
                'Morning Snack': 3,
                'Afternoon Snack': 4
              };
              
              // Process each day in the form
              for (let i = 0; i < daysArray.length; i++) {
                const dayGroup = daysArray.at(i) as FormGroup;
                const dayName = dayGroup.get('name')?.value;
                
                // Find the matching day in the template (handle different API naming)
                const matchingDay = days.find((d: { dayName: any; DayName: any; name: any; Name: any; }) => 
                  (d.dayName === dayName) || (d.DayName === dayName) || 
                  (d.name === dayName) || (d.Name === dayName)
                );
                
                if (matchingDay) {
                  // Get the meals from the matching day (handle different API naming)
                  const templateMeals = matchingDay.meals || matchingDay.Meals || [];
                  
                  // Get the meals FormArray for this day
                  const mealsArray = dayGroup.get('meals') as FormArray;
                  
                  // Process each meal in the template
                  templateMeals.forEach((meal: { mealType: any; MealType: any; type: any; Type: any; meal: any; Meal: any; }) => {
                    const mealType = meal.mealType || meal.MealType || meal.type || meal.Type;
                    const mealContent = meal.meal || meal.Meal || '';
                    
                    // Find the right place to put this meal in the form
                    if (mealType in mealTypeToIndex) {
                      const formIndex = mealTypeToIndex[mealType as MealType];
                      
                      if (formIndex !== undefined && formIndex < mealsArray.length) {
                        // Set the meal content in the correct form control
                        mealsArray.at(formIndex).get('meal')?.setValue(mealContent);
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
          
          // Hide template selector and clear messages after delay
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




