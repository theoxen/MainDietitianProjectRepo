import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DietService } from '../../../services/diet.service';
import { Router } from '@angular/router';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-add-diets',
  standalone: true,
  templateUrl: './add-diets.component.html',
  styleUrls: ['./add-diets.component.css'],
  imports: [NavBarComponent]
})
export class AddDietsComponent implements OnInit {
  dietForm!: FormGroup;
  private fb = inject(FormBuilder);
  private dietService = inject(DietService);
  private router = inject(Router);

  ngOnInit(): void {
    this.dietForm = this.fb.group({
      Name: ['', Validators.required],
      IsTemplate: [false],
      // Days is an array of objects; for simplicity, we initialize with 7 days
      DietDays: this.fb.array(Array(7).fill(0).map((_, i) =>
        this.fb.group({
          DayName: [`Day ${i + 1}`, Validators.required],
          DietMeals: this.fb.array(
            ['ΠΡΩΙΝΟ', 'ΕΝΔΙΑΜΕΣΟ Ή ΑΠΟΓΕΥΜΑΤΙΝΟ Ή ΠΡΟ ΥΠΝΟΥ', 'ΜΕΣΗΜΕΡΙΑΝΟ'].map(type =>
              this.fb.group({
                MealType: [type],
                Meal: ['', Validators.required]
              })
            )
          )
        })
      )
    });
  }

  get dietDays(): FormArray {
    return this.dietForm.get('DietDays') as FormArray;
  }

  onSubmit(): void {
    if (this.dietForm.valid) {
      this.dietService.addDiet(this.dietForm.value).subscribe({
        next: (result) => {
          console.log('Diet added:', result);
          this.router.navigate(['/clients', this.dietForm.value.clientId, 'diets']);
        },
        error: (err) => console.error('Error adding diet:', err)
      });
    }
  }
}