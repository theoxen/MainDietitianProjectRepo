import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientManagementService } from '../../../services/client-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { NoteService } from '../../../services/note.service';
import { Note } from '../../../models/notes/note';
import { MetricsService } from '../../../services/metrics.service';
import { Metrics } from '../../../models/metrics/metrics';
import { CommonModule } from '@angular/common';
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diet';

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-history.component.html',
  styleUrl: './client-history.component.css'
})
export class ClientHistoryComponent implements OnInit {
  clientManagementService = inject(ClientManagementService);
  noteService = inject(NoteService);
  metricsService = inject(MetricsService);
  dietService = inject(DietService);


  clientId: string | null = null;
  client: ClientProfile | null = null;
  clientNote: Note | null = null;
  clientMetrics: Metrics[] | null = null;
  dietId: string | null = null; 
  clientDiet: any;

  dietDays: any[] = [];
  dietMeals: any[] = [];
  allMealItems: any[] = [];


  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.clientId = this.route.snapshot.paramMap.get('clientId');
    console.log("Captured Client ID in ClientHistoryComponent:", this.clientId);

    if (this.clientId) {
      // Fetch client details
      this.clientManagementService.getClientDetails(this.clientId).subscribe(client => {
        this.client = client;
      });

      // Fetch client note
      this.noteService.fetchNoteForUser(this.clientId).subscribe({
        next: (note) => {
          this.clientNote = note;
        },
        error: (error) => {
          console.error("Error fetching note:", error);
        }
      });

      // Fetch client metrics
      this.metricsService.fetchMetricsForUser(this.clientId).subscribe({
        next: (metrics) => {
          this.clientMetrics = metrics; // Store the metrics
        },
        error: (error) => {
          console.error("Error fetching client metrics:", error);
        }
      });

      // Fetch client diet ID then diet details
      this.dietService.fetchUserDietsWithUserId(this.clientId).subscribe({
        next: (userDietObject) => {
          console.log('Fetched diets response:', userDietObject);
          this.dietId = (userDietObject as any).data;
          
          if (this.dietId) {
            // Fetch the detailed diet using the dietId
            this.fetchClientDiet();
          }
        },
        error: (error) => {
          console.error("Error fetching diet id:", error);
        }
      });
    }
    
  }

  fetchClientDiet(): void {
    if (!this.dietId) return;
    
    this.dietService.fetchDietForUser(this.dietId).subscribe({
      next: (diet) => {
        this.clientDiet = (diet as any).data;
        console.log("Client Diet:", this.clientDiet);

        if (this.clientDiet && this.clientDiet.days) {
          this.dietDays = this.clientDiet.days;
          
          // Extract all meals across all days
          this.dietMeals = [];
          this.allMealItems = [];
          
          this.dietDays.forEach(day => {
            if (day.meals && day.meals.length) {
              day.meals.forEach((meal: any) => {
                // Add day number to each meal for reference
                meal.dayNumber = day.dayNumber || 1;
                this.dietMeals.push(meal);
                
                // Extract all meal items
                if (meal.items && meal.items.length) {
                  meal.items.forEach((item: any) => {
                    // Add meal period and day to each item for reference
                    item.mealPeriod = meal.mealPeriod;
                    item.dayNumber = day.dayNumber || 1;
                    this.allMealItems.push(item);
                  });
                }
              });
            }
          });
        }
      },
      error: (error) => {
        console.error("Error fetching detailed diet:", error);
      }
    });
  }

  calculateClientAge(client: ClientProfile | null): number {
      if (!client || !client.dateOfBirth) {
        return 0; // Handle missing data
      }
      
      const dob = new Date(client.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      // Adjust if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return age;
    }

  // navigateTo(route: string) {
  //   if (this.clientId) {
  //     const updatedRoute = route.replace(':clientId', this.clientId);
  //     this.router.navigate([updatedRoute]);
  //   }
  // }

}



