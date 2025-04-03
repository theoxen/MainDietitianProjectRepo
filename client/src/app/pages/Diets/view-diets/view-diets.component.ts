import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diets/diet';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-view-diets',
  standalone: true,
  imports: [CommonModule, NavBarComponent],
  templateUrl: './view-diets.component.html',
  styleUrls: ['./view-diets.component.css']
})
export class ViewDietsComponent implements OnInit {
  diet: Diet | null = null;
  clientId: string = '';
  // Define the meal types to display in the table rows.
  mealTypes: string[] = ['ΠΡΩΙΝΟ', 'ΕΝΔΙΑΜΕΣΟ Ή ΑΠΟΓΕΥΜΑΤΙΝΟ Ή ΠΡΟ ΥΠΝΟΥ', 'ΜΕΣΗΜΕΡΙΑΝΟ'];

  private dietService = inject(DietService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Get the clientId from the route parameters.
    this.clientId = this.route.snapshot.paramMap.get('clientId') ?? '';

    if (this.clientId) {
      // Assume fetchDietsForUser returns an observable of Diet[]
      this.dietService.fetchDietsForUser(this.clientId).subscribe({
        next: (diets: Diet[]) => {
          // Use the first diet in the list.
          this.diet = diets[0];
          console.log("Diet loaded:", this.diet);
        },
        error: (error) => console.error('Error fetching diets:', error)
      });
    } else {
      console.error("No clientId provided in the route.");
    }
  }

  // For a given day object, return the meal that matches the specified meal type.
  getMealForDay(day: any, mealType: string) {
    if (!day.DietMeals) return null;
    return day.DietMeals.find((m: any) => m.MealType === mealType);
  }
}