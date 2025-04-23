import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { TemplatesService } from '../../../services/templates.service';

@Component({
  selector: 'edit-templates',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavBarComponent],
  templateUrl: './edit-templates.component.html',
  styleUrls: ['./edit-templates.component.css']
})
export class EditTemplatesComponent implements OnInit {
  editTemplateForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    templateDays: new FormArray([])
  });
  
  templateService = inject(TemplatesService);
  dialogRef = inject(MatDialogRef<EditTemplatesComponent>);
  data = inject<any>(MAT_DIALOG_DATA);
  successMessage: string = '';
  errorMessage: string = '';
  
  ngOnInit(): void {
    this.initializeTemplateDaysForm();
    if(this.data?.templateId) {
      this.fetchTemplateForEdit(this.data.templateId);
    }
  }
  
  initializeTemplateDaysForm() {
    const daysArray = this.editTemplateForm.get('templateDays') as FormArray;
    // Clear existing form array items
    while (daysArray.length > 0) {
      daysArray.removeAt(0);
    }
    
    // Add 7 days
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
  
  createMealFormGroup(mealType: string): FormGroup {
    return new FormGroup({
      id: new FormControl(''),
      mealType: new FormControl(mealType),
      meal: new FormControl('')
    });
  }
  
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
  
  populateForm(template: any): void {
    // console.log('Populating form with template:', template);
    
    // Set basic template properties
    this.editTemplateForm.patchValue({
      id: template.id,
      name: template.name
    });
    
    // Get the days array from the form
    const daysArray = this.editTemplateForm.get('templateDays') as FormArray;
    
    // Get the days from the template object
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
  
  getDayNameByIndex(index: number): string {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayNames[index];
  }
  
  updateTemplate() {
    if(this.editTemplateForm.invalid){
      this.editTemplateForm.markAllAsTouched();
      return;
    }
    
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
    
    this.templateService.updateTemplate(templateToUpdate).subscribe({
      next: (template: any) => {
        this.successMessage = 'Template updated successfully!';
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 1500);
      },
      error: (error: any) => {
        console.error("Error updating template:", error);
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
  
  getDayMealControl(dayIndex: number, mealIndex: number): FormControl {
    const days = this.editTemplateForm.get('templateDays') as FormArray;
    const day = days.at(dayIndex) as FormGroup;
    const meals = day.get('meals') as FormArray;
    return meals.at(mealIndex).get('meal') as FormControl;
  }
  
  cancel(): void {
    this.dialogRef.close(false);
  }
}