import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { TemplatesService } from '../../../services/templates.service';

/**
 * Component for editing meal plan templates
 * Handles creating and updating weekly meal templates with custom meal plans for each day
 */
@Component({
  selector: 'edit-templates',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavBarComponent],
  templateUrl: './edit-templates.component.html',
  styleUrls: ['./edit-templates.component.css']
})
export class EditTemplatesComponent implements OnInit {
  // Main form group for template editing with nested form structure
  editTemplateForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]), // Template name is required
    templateDays: new FormArray([]) // Will contain 7 days of meal plans
  });
  
  // Services and dependencies injected using the modern inject() pattern
  templateService = inject(TemplatesService);
  dialogRef = inject(MatDialogRef<EditTemplatesComponent>);
  data = inject<any>(MAT_DIALOG_DATA); // Contains templateId if editing existing template
  successMessage: string = '';
  errorMessage: string = '';
  
  /**
   * Initialize component and load template data if editing an existing template
   */
  ngOnInit(): void {
    this.initializeTemplateDaysForm();
    if(this.data?.templateId) {
      this.fetchTemplateForEdit(this.data.templateId);
    }
  }
  
  /**
   * Sets up the form structure with 7 days of the week and 5 meals per day
   * Creates the nested structure of FormGroups and FormArrays
   */
  initializeTemplateDaysForm() {
    const daysArray = this.editTemplateForm.get('templateDays') as FormArray;
    // Clear existing form array items
    while (daysArray.length > 0) {
      daysArray.removeAt(0);
    }
    
    // Add 7 days with standard meal types for each day
    const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    dayNames.forEach(name => {
      daysArray.push(new FormGroup({
        id: new FormControl(''),
        name: new FormControl(name),
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
   * Helper method to create a meal FormGroup with consistent structure
   * @param mealType The type of meal (Breakfast, Lunch, etc.)
   * @returns FormGroup with id, mealType and meal content
   */
  createMealFormGroup(mealType: string): FormGroup {
    return new FormGroup({
      id: new FormControl(''),
      mealType: new FormControl(mealType),
      meal: new FormControl('')
    });
  }
  
  /**
   * Fetches template data from API when editing an existing template
   * @param templateId ID of the template to edit
   */
  fetchTemplateForEdit(templateId: string): void {
    this.templateService.getTemplateById(templateId).subscribe({
      next: (template: any) => {
        this.populateForm(template);
      },
      error: (error: any) => {
        console.error("Error fetching template:", error);
        this.errorMessage = "Error loading template. Please try again.";
      }
    });
  }
  
  /**
   * Populates the form with existing template data
   * Handles mapping API data to the form structure
   * @param template Template object from the API
   */
  populateForm(template: any): void {
    // console.log('Populating form with template:', template);
    
    // Set basic template properties
    this.editTemplateForm.patchValue({
      id: template.id,
      name: template.name
    });
    
    // Get the days array from the form
    const daysArray = this.editTemplateForm.get('templateDays') as FormArray;
    
    // Get the days from the template object (handles different API response formats)
    const templateDays = template.templateDays || template.days || [];
    
    // Process each day
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      // Find the corresponding day in the template data
      const templateDay = templateDays.find((d: any) => {
        const dayName = d.name || d.dayName || '';
        // Match day based on index (0=Monday, 1=Tuesday, etc.)
        return this.getDayNameByIndex(dayIndex) === dayName;
      });
      
      if (templateDay && dayIndex < daysArray.length) {
        const dayFormGroup = daysArray.at(dayIndex) as FormGroup;
        
        // Set day ID if it exists
        if (templateDay.id) {
          dayFormGroup.get('id')?.setValue(templateDay.id);
        }
        
        // Get meals for this day
        const templateMeals = templateDay.meals || [];
        const mealsArray = dayFormGroup.get('meals') as FormArray;
        
        // Process each meal type
        const mealTypes = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'];
        mealTypes.forEach((mealType, mealIndex) => {
          // Find the meal with this type
          const meal = templateMeals.find((m: any) => 
            m.mealType === mealType || m.type === mealType
          );
          
          if (meal && mealIndex < mealsArray.length) {
            // Get the form group for this meal
            const mealFormGroup = mealsArray.at(mealIndex) as FormGroup;
            
            // Set meal ID if it exists
            if (meal.id) {
              mealFormGroup.get('id')?.setValue(meal.id);
            }
            
            // Set the meal content
            const mealContent = meal.meal || '';
            mealFormGroup.get('meal')?.setValue(mealContent);
          }
        });
      }
    }
  }
  
  /**
   * Helper method to convert day index to day name
   * @param index Index of day (0-6)
   * @returns Name of the day
   */
  getDayNameByIndex(index: number): string {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayNames[index];
  }
  
  /**
   * Submits the form to update an existing template
   * Transforms form data to match API expected format
   */
  updateTemplate() {
    // Validate form before submission
    if(this.editTemplateForm.invalid){
      this.editTemplateForm.markAllAsTouched();
      return;
    }
    
    // Prepare data object for API with proper structure
    const templateToUpdate = {
      id: this.editTemplateForm.get('id')?.value,
      name: this.editTemplateForm.get('name')?.value,
      days: this.editTemplateForm.get('templateDays')?.value.map((day: any) => ({
        id: day.id,
        dayName: day.name,
        meals: day.meals.map((meal: any) => ({
          id: meal.id,
          mealType: meal.mealType,
          meal: meal.meal
        }))
      }))
    };
    
    // Send update request to API
    this.templateService.updateTemplate(templateToUpdate).subscribe({
      next: (template: any) => {
        this.successMessage = 'Template updated successfully!';
        // Close dialog after brief delay to show success message
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 1500);
      },
      error: (error: any) => {
        console.error("Error updating template:", error);
        // Handle specific error cases with custom messages
        if (error?.error?.errors && Array.isArray(error.error.errors)) {
          const templateExistsError = error.error.errors.find(
            (err: any) => err.identifier === 'TemplateAlreadyExists'
          );
          if (templateExistsError) {
            this.errorMessage = "Template with this name already exists. Please choose a different name.";
          } else {
            this.errorMessage = "Failed to update template. Please try again.";
          }
        } else {
          this.errorMessage = "An error occurred. Please try again.";
        }
      }
    });
  }
  
  /**
   * Helper method to get a specific meal's form control for validation/display
   * @param dayIndex Index of the day (0-6)
   * @param mealIndex Index of the meal (0-4)
   * @returns FormControl for the specific meal
   */
  getDayMealControl(dayIndex: number, mealIndex: number): FormControl {
    const days = this.editTemplateForm.get('templateDays') as FormArray;
    const day = days.at(dayIndex) as FormGroup;
    const meals = day.get('meals') as FormArray;
    return meals.at(mealIndex).get('meal') as FormControl;
  }
  
  /**
   * Close the dialog without saving changes
   */
  cancel(): void {
    this.dialogRef.close(false);
  }
}