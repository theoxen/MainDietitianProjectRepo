import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diets/diet';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-view-diets',
  standalone: true,
  templateUrl: './view-diets.component.html',
  styleUrls: ['./view-diets.component.css'],
  imports: [NavBarComponent]
})
export class ViewDietsComponent implements OnInit {
  diet: Diet | null = null;
  clientId: string = '';
  // For table display: assume each Day has a name and a list of Meals with a type and text.
  days: string[] = [];
  mealTypes: string[] = ['ΠΡΩΙΝΟ', 'ΕΝΔΙΑΜΕΣΟ Ή ΑΠΟΓΕΥΜΑΤΙΝΟ Ή ΠΡΟ ΥΠΝΟΥ', 'ΜΕΣΗΜΕΡΙΑΝΟ'];

  private dietService = inject(DietService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId') ?? '';
    if (this.clientId) {
      this.dietService.fetchDietsForUser(this.clientId).subscribe({
        next: (diets) => {
          // Assume the first diet is the active one for this client
          this.diet = diets[0];
          if (this.diet && this.diet.DietDays?.length) {
            this.days = this.diet.DietDays.map(day => day.DayName);
          }
        },
        error: (error) => console.error('Error fetching diets:', error)
      });
    }
  }
}