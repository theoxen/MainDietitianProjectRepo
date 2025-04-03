import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";


@Component({
  selector: 'app-edit-diets',
  standalone: true,
  templateUrl: './edit-diets.component.html',
  styleUrls: ['./edit-diets.component.css'],
  imports: [CommonModule, ReactiveFormsModule, NavBarComponent]
})
export class EditDietsComponent implements OnInit {
getDietMeals(_t21: AbstractControl<any,any>) {
throw new Error('Method not implemented.');
}
  dietForm!: FormGroup;
  dietId: string = '';
  private fb = inject(FormBuilder);
  private dietService = inject(DietService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.dietId = this.route.snapshot.paramMap.get('dietId') ?? '';
    // Initialize form structure matching AddDietsComponent
    this.dietForm = this.fb.group({
      Id: [this.dietId],
      Name: ['', Validators.required],
      IsTemplate: [false],
      DietDays: this.fb.array([])
    });
    // Load existing diet data and patch form
    this.dietService.fetchDietById(this.dietId).subscribe({
      next: (diet) => {
        this.dietForm.patchValue({
          Name: diet.name,
          IsTemplate: diet.isTemplate
        });
        const daysFA = this.fb.array(
          diet.dietDays.map(day =>
            this.fb.group({
              DayName: [day.dayName, Validators.required],
              DietMeals: this.fb.array(
                day.DietMeals.map(meal =>
                  this.fb.group({
                    MealType: [meal.MealType],
                    Meal: [meal.meal, Validators.required]
                  })
                )
              )
            })
          )
        );
        this.dietForm.setControl('DietDays', daysFA);
      },
      error: (err) => console.error('Error loading diet:', err)
    });
  }

  get dietDays(): FormArray {
    return this.dietForm.get('DietDays') as FormArray;
  }

  onSubmit(): void {
    if (this.dietForm.valid) {
      this.dietService.editDiet(this.dietForm.value).subscribe({
        next: (result) => {
          console.log('Diet updated:', result);
          this.router.navigate(['/clients', this.route.snapshot.paramMap.get('clientId'), 'diets']);
        },
        error: (err) => console.error('Error updating diet:', err)
      });
    }
  }
}