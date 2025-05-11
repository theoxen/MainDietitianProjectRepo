import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { TemplatesService } from '../../../services/templates.service';
import { MatDialogRef } from '@angular/material/dialog'; // For handling dialog interactions

/**
 * Component for creating new diet templates
 * Uses reactive forms to manage complex nested form structure (days > meals)
 */
@Component({
  selector: 'add-templates',
  standalone: true, // Angular standalone component (doesn't need to be declared in a module)
  imports: [ReactiveFormsModule, CommonModule, NavBarComponent], // Required imports for template functionality
  templateUrl: './add-templates.component.html',
  styleUrls: ['./add-templates.component.css']
})
export class AddTemplatesComponent implements OnInit {
  // Main form group with name field and nested form array for days
  addTemplateForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]), // Template name is required
    templateDays: new FormArray([]) // Will contain 7 days with meals
  });
  
  // Using inject() instead of constructor DI (Angular 14+ feature)
  templateService = inject(TemplatesService); // Service to handle API calls
  dialogRef = inject(MatDialogRef<AddTemplatesComponent>); // Reference to the dialog this component is in
  successMessage: string = ''; // Displays success feedback to user
  errorMessage: string = ''; // Displays error feedback to user
  
  /**
   * Lifecycle hook that runs when component initializes
   * Sets up the initial form structure with days and meals
   */
  ngOnInit(): void {
    this.initializeTemplateDaysForm();
  }
  
  /**
   * Creates the complex form structure with 7 days, each containing 5 meal types
   * Form hierarchy: templateDays(FormArray) > day(FormGroup) > meals(FormArray) > meal(FormGroup)
   */
  initializeTemplateDaysForm() {
    const daysArray = this.addTemplateForm.get('templateDays') as FormArray;
    // Add 7 days
    const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    dayNames.forEach(name => {
      daysArray.push(new FormGroup({
        name: new FormControl(name), // Day name is pre-filled and not editable
        meals: new FormArray([
          this.createMealFormGroup('Breakfast'),
          this.createMealFormGroup('Morning Snack'),
          this.createMealFormGroup('Lunch'),
          this.createMealFormGroup('Afternoon Snack'),
          this.createMealFormGroup('Dinner')
        ])
      }));
    });
  }
  
  /**
   * Factory method to create consistent meal form groups
   * @param mealType String representing the meal type (e.g., "Breakfast")
   * @returns FormGroup with mealType (preset) and meal (user input) controls
   */
  createMealFormGroup(mealType: string): FormGroup {
    return new FormGroup({
      mealType: new FormControl(mealType), // Meal type is pre-filled and not editable
      meal: new FormControl('') // Actual meal content to be filled by user
    });
  }
  
  /**
   * Form submission handler - validates, transforms data, and calls API
   * Transforms hierarchical form data into the structure expected by the API
   */
  addTemplate() {
    if(this.addTemplateForm.invalid){
      this.addTemplateForm.markAllAsTouched(); // Triggers validation visuals for all fields
      return;
    }
    
    // Transform form data into API-expected format
    const templateToAdd = {
        name: this.addTemplateForm.controls['name'].value,
        days: this.addTemplateForm.controls['templateDays'].value.map((day: any) => ({
          dayName: day.name,
          meals: day.meals.map((meal: any) => ({
            mealType: meal.mealType,
            meal: meal.meal
          }))
        }))
      };
    
    // Call service to save template and handle response
    this.templateService.createTemplate(templateToAdd).subscribe({
      next: (template: any) => {
        this.successMessage = 'Template added successfully!';
        setTimeout(() => {
          this.dialogRef.close(true); // Close dialog and indicate success after delay
        }, 1500);
      },
      error: (error: any) => {
        console.error("Error adding template:", error);
        this.errorMessage = "Error adding template. Please try again later.";
      }
    });
  }
  
  /**
   * Handles dialog cancel action
   * Closes dialog without saving changes
   */
  cancel(): void {
    this.dialogRef.close(false); // Close dialog and indicate cancellation
  }
  
  /**
   * Helper method to easily access individual meal controls in the template
   * Used by the template to bind form controls to inputs
   * @param dayIndex Index of the day in the templateDays array
   * @param mealIndex Index of the meal in the day's meals array
   * @returns FormControl for the specific meal's content
   */
  getDayMealControl(dayIndex: number, mealIndex: number): FormControl {
    const days = this.addTemplateForm.get('templateDays') as FormArray;
    const day = days.at(dayIndex) as FormGroup;
    const meals = day.get('meals') as FormArray;
    return meals.at(mealIndex).get('meal') as FormControl;
  }
}