import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diets/diet';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-diets',
  standalone: true,
  imports: [NavBarComponent,CommonModule],
  templateUrl: './view-diets.component.html',
  styleUrls: ['./view-diets.component.css']
 
})
export class ViewDietsComponent implements OnInit {
  diet: Diet | null = null;
  clientId: string = '';
  // For table display: assume each Day has a name and a list of Meals with a type and text.
  days: string[] = [];
  mealTypes: string[] = ['ΠΡΩΙΝΟ', 'ΕΝΔΙΑΜΕΣΟ Ή ΑΠΟΓΕΥΜΑΤΙΝΟ Ή ΠΡΟ ΥΠΝΟΥ', 'ΜΕΣΗΜΕΡΙΑΝΟ'];

  private dietService = inject(DietService);
  private route = inject(ActivatedRoute);

  getMealForDay(day: any, mealType: string) {
    return day.DietMeals.find((m: any) => m.MealType === mealType);
  }


  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId') ?? '';
    if (this.clientId) {
      this.dietService.fetchDietsForUser(this.clientId).subscribe({
        next: (diets) => {
          // Assume the first diet is the active one for this client
          this.diet = diets[0];
          if (this.diet && this.diet.dietDays?.length) {
            this.days = this.diet.dietDays.map(day => day.dayName);
          }
        },
        error: (error) => console.error('Error fetching diets:', error)
      });
    }
  }
}