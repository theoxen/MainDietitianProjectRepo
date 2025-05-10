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
import { PaginationComponent } from "../../pagination/pagination.component";
import { Diet } from '../../../models/diets/diet';
import { Location } from '@angular/common';

/**
 * Component for displaying a client's full history, including details, notes, metrics, and diets.
 */
@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule, PaginationComponent, NavBarComponent],
  templateUrl: './client-history.component.html',
  styleUrl: './client-history.component.css'
})
export class ClientHistoryComponent implements OnInit {
  // Injected services for API calls and navigation
  clientManagementService = inject(ClientManagementService);
  noteService = inject(NoteService);
  metricsService = inject(MetricsService);
  dietService = inject(DietService);

  // State variables for client and related data
  clientId: string | null = null;
  client: ClientProfile | null = null;
  clientNote: Note | null = null;
  clientMetrics: Metrics[] | null = null;
  clientDiets: Diet[] = [];
  transformedDiets: { id: any; date: any; name: any; isTemplate: any }[] = [];
  dietId: string | null = null;
  selectedDiet: any = null;
  
  constructor(private route: ActivatedRoute, private router: Router,   private location: Location  ) { }

  /**
   * On component initialization, fetch all client-related data.
   */
  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.clientId = this.route.snapshot.paramMap.get('clientId');

    if (this.clientId) {
      // Fetch client details from API
      this.clientManagementService.getClientDetails(this.clientId).subscribe(client => {
        this.client = client;
      });

      // Fetch client note from API
      this.noteService.fetchNoteForUser(this.clientId).subscribe({
        next: (note) => {
          this.clientNote = note;
        },
        error: (error) => {
          console.error("Error fetching note:", error);
        }
      });

      // Fetch client metrics (body weight, fat mass, etc.)
      this.metricsService.fetchMetricsForUser(this.clientId).subscribe({
        next: (metrics) => {
          this.clientMetrics = metrics;
        },
        error: (error) => {
          console.error("Error fetching client metrics:", error);
        }
      });

      // Fetch all diets for the client
      this.dietService.fetchDietsForUser(this.clientId).subscribe({
        next: (response: any) => {
          
          // Handle different response formats (array, object, etc.)
          let fetchedDiets;
          if (response && response.data) {
            fetchedDiets = response.data;
          } else if (Array.isArray(response)) {
            fetchedDiets = response;
          } else if (response) {
            fetchedDiets = [response];
          } else {
            fetchedDiets = [];
          }
          
          this.clientDiets = fetchedDiets;
          this.transformDiets(); // Prepare diets for display
        },
        error: (error) => {
          console.error("Error fetching client diets:", error);
        }
      });
    }
  }

  /**
   * Format a date string or object to dd/MM/yyyy for display.
   */
  formatDate(dateInput: string | Date): string {
    const dateObj = new Date(dateInput);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Transform raw diets data into a format suitable for the table.
   * Handles different property names and normalizes structure.
   */
  transformDiets(): void {
    if (!this.clientDiets || !Array.isArray(this.clientDiets)) {
      console.warn('No diets data to transform');
      this.transformedDiets = [];
      return;
    }
  
    this.transformedDiets = this.clientDiets.map(diet => {
      const typedDiet = diet as any; 
      
      // Normalize dietDays to Days if needed
      if (typedDiet.dietDays && !typedDiet.Days) {
        typedDiet.Days = typedDiet.dietDays.map((day: any) => {
          if (day.dietMeals && !day.Meals) {
            day.Meals = day.dietMeals.map((meal: any) => ({
              Type: meal.mealType,
              Meal: meal.meal
            }));
          }
          return day;
        });
      }
      
      return {
        id: typedDiet.id,
        date: this.formatDate(typedDiet.dateCreated),
        name: typedDiet.name,
        isTemplate: typedDiet.isTemplate,
        fullDiet: typedDiet
      };
    });
    
  }

  /**
   * Check if there are any valid diets to display.
   * Prevents showing empty/placeholder diets.
   */
  hasValidDiets(): boolean {
    // First check if there are any diets at all
    if (!this.clientDiets || this.clientDiets.length === 0) {
      return false;
    }
    
    // Check if we have at least one diet with actual content
    // This prevents showing empty/placeholder diets
    const validDiet = this.clientDiets.find(diet => {
      // Check if diet has actual data, not just empty placeholders
      return (
        (diet.id && diet.id !== '') || 
        (diet.name && diet.name !== 'Unnamed Diet') ||
        (diet.dateCreated && diet.dateCreated !== null)
      );
    });
    
    return !!validDiet;
  }

  /**
   * Calculate the client's age based on date of birth.
   */
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

  /**
   * Get meal data for a specific day and meal type from the selected diet.
   * Handles different property names and structures.
   */
  getDayMeal(dayIndex: number, mealType: string): string {
    // Check if diet exists
    if (!this.selectedDiet) {
      return '';
    }

    // Handle all possible property names for days
    const days = this.selectedDiet.Days || this.selectedDiet.days || this.selectedDiet.dietDays;
    if (!days || !Array.isArray(days)) {
      return '';
    }

    // Make sure the day exists at the index
    const day = days[dayIndex];
    if (!day) {
      return '';
    }

    // Get meals from any possible property name
    const meals = day.Meals || day.meals || day.dietMeals;
    if (!meals || !Array.isArray(meals)) {
      return '';
    }

    // Find the meal - handle different property naming conventions
    const meal = meals.find(m => 
      (m.type === mealType) || (m.Type === mealType) || (m.mealType === mealType)
    );

    // Return meal content if found
    if (meal) {
      return meal.meal || meal.Meal || '';
    }
    
    return '';
  }

  /**
   * Get the meal content for a specific meal type from a meals array.
   * Handles fallback for generic 'Snack' if needed.
   */
  getMealContent(meals: any[], mealType: string): string {
    if (!meals || !Array.isArray(meals)) {
      return '';
    }
    
    // First try exact match
    const meal = meals.find(m => m.Type === mealType);
    
    // If found, return the meal content
    if (meal) {
      return meal.Meal;
    }
    
    // For Morning Snack or Afternoon Snack, try generic 'Snack' if not found
    if ((mealType === 'Morning Snack' || mealType === 'Afternoon Snack') && 
        meals.some(m => m.Type === 'Snack')) {
      return meals.find(m => m.Type === 'Snack')?.Meal || '';
    }
    
    return '';
  }

  /**
   * Show the details of a selected diet in the modal.
   * Fetches full diet data from API if not already present.
   */
  showDietDetails(diet: any) {
    // Determine what object to use as the selected diet
    if (diet.fullDiet) {
      this.selectedDiet = diet.fullDiet;
    } else if (diet.diet) {
      this.selectedDiet = diet.diet;
    } else {
      this.selectedDiet = diet;
    }
    
    // Check various possible structures for the diet data
    const typedDiet = this.selectedDiet as any;
    
    // Ensure we have a valid ID regardless of property name case (id vs Id)
    const dietId = typedDiet.id || typedDiet.Id;
    
    // If we don't have any data in days arrays, fetch the full diet from the API
    if ((!typedDiet.Days || typedDiet.Days.length === 0) && 
        (!typedDiet.days || typedDiet.days.length === 0) && 
        (!typedDiet.dietDays || typedDiet.dietDays.length === 0)) {
      
      // If no diet days found, fetch detailed diet data by ID
      if (dietId) {
        // Fetch full diet details from the API
        this.dietService.fetchDietById(dietId).subscribe({
          next: (response: any) => {
            // Update the selected diet with the fetched data
            if (response && response.data) {
              this.selectedDiet = response.data;
            } else if (response) {
              this.selectedDiet = response;
            }
            
            // Process the newly fetched data
            this.processSelectedDiet();
          },
          error: (error: any) => {
            console.error('Error fetching detailed diet data:', error);
          }
        });
        
        return; 
      }
    }
    
    // Process the diet data that we already have
    this.processSelectedDiet();
  }
  
  /**
   * Normalize and process the selected diet's structure for display.
   * Handles different property names and fills missing fields.
   */
  processSelectedDiet() {
    if (!this.selectedDiet) {
      console.error('No selected diet to process');
      return;
    }
    
    const typedDiet = this.selectedDiet as any;
    
    // Format the date if needed
    if (typedDiet.dateCreated && !typedDiet.date) {
      typedDiet.date = this.formatDate(typedDiet.dateCreated);
    }

    // Handle case where we have dietDays instead of Days
    if (typedDiet.dietDays && (!typedDiet.Days || typedDiet.Days.length === 0)) {
      typedDiet.Days = typedDiet.dietDays.map((day: any) => {
        const normalizedDay = { ...day };
        
        // Initialize empty meals array if needed
        if (!normalizedDay.Meals && !normalizedDay.dietMeals) {
          normalizedDay.Meals = [];
        } else if (normalizedDay.dietMeals && !normalizedDay.Meals) {
          normalizedDay.Meals = normalizedDay.dietMeals.map((meal: any) => ({
            Type: meal.mealType, 
            Meal: meal.meal
          }));
        }
        
        return normalizedDay;
      });
    }
    
    // Look for diet days in other possible locations in the object
    if ((!typedDiet.Days || typedDiet.Days.length === 0) && typedDiet.days && typedDiet.days.length > 0) {
      typedDiet.Days = typedDiet.days;
    }
  }

  /**
   * Close the diet details modal by clearing the selected diet.
   */
  closeDietDetails(): void {
    this.selectedDiet = null;
  }

  /**
   * Navigate back to the previous page.
   */
  goBack(): void {
    this.location.back();
  }
}