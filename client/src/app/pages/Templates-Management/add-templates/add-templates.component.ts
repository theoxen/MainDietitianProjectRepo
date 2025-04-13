import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { TemplatesService } from '../../../services/templates.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'add-templates',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavBarComponent],
  templateUrl: './add-templates.component.html',
  styleUrls: ['./add-templates.component.css']
})
export class AddTemplatesComponent implements OnInit {
  addTemplateForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    templateDays: new FormArray([])
  });
  
  templateService = inject(TemplatesService);
  dialogRef = inject(MatDialogRef<AddTemplatesComponent>);
  successMessage: string = '';
  errorMessage: string = '';
  
  ngOnInit(): void {
    this.initializeTemplateDaysForm();
  }
  
  initializeTemplateDaysForm() {
    const daysArray = this.addTemplateForm.get('templateDays') as FormArray;
    // Add 7 days
    const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    dayNames.forEach(name => {
      daysArray.push(new FormGroup({
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
      mealType: new FormControl(mealType),
      meal: new FormControl('')
    });
  }
  
  addTemplate() {
    if(this.addTemplateForm.invalid){
      this.addTemplateForm.markAllAsTouched();
      return;
    }
    
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
    
    this.templateService.createTemplate(templateToAdd).subscribe({
      next: (template: any) => {
        this.successMessage = 'Template added successfully!';
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 1500);
      },
      error: (error: any) => {
        console.error("Error adding template:", error);
        this.errorMessage = "Error adding template. Please try again later.";
      }
    });
  }
  
  cancel(): void {
    this.dialogRef.close(false);
  }
  
  getDayMealControl(dayIndex: number, mealIndex: number): FormControl {
    const days = this.addTemplateForm.get('templateDays') as FormArray;
    const day = days.at(dayIndex) as FormGroup;
    const meals = day.get('meals') as FormArray;
    return meals.at(mealIndex).get('meal') as FormControl;
  }
}