import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diets/diet';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { ReactiveFormErrorComponent } from "../../../components/reactive-form-error/reactive-form-error.component";
import { PaginationComponent } from '../../pagination/pagination.component';
import { EditDietsComponent } from '../edit-diets/edit-diets.component';
import { AddDietsComponent } from '../add-diets/add-diets.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientManagementService } from '../../../services/client-management.service';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClientProfile } from '../../../models/client-management/client-profile';


import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'view-diets',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PaginationComponent , CommonModule],
  templateUrl: './view-diets.component.html',
  styleUrls: ['./view-diets.component.css']
})



export class ViewDietsComponent implements OnInit {

  isEditMode = false;
  editDietForm: FormGroup = new FormGroup({});
  successMessage: string | null = null;
  
  
  showDietDetailsModal = false;
  selectedDiet: any = null;

  isConfirmationWindowVisible = false;
  clientName!:string;
  clientId!: string;
  errorMessage: string = "";

  diets!: Diet[];
  transformedDiets: { id: any; date: any ; name: any; isTemplate: any }[] = [];

  filteredDiets: { id: any; name: any; isTemplate: any ; date:any }[] = [];
  searchControl = new FormControl('');

    showErrorOnControlTouched!: boolean;
    errorMessages!: Map<string,string>;
    showErrorOnControlDirty!: boolean;
    type: any;
    placeholder: any;
    control!: FormControl<any>;
    totalItems = 100;   // For example, total items available
    pageSize = 10;
    currentPage = 1;
    items = [/* array of data */];

/////////////////////////////////////////////////////TO CHANGE

    pagedItems:{ id: any; name: any; isTemplate: any ; date:any }[] = [];
    dateSearchForm = new FormGroup({
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });


  dietService = inject(DietService);
  clientManagementService = inject(ClientManagementService);

  constructor(private dialog: MatDialog, private route: ActivatedRoute, private router:Router) {}
  ngOnInit(): void {
    this.loadPage(this.currentPage);

    this.clientId = this.route.snapshot.paramMap.get('clientId')!;
    if (this.clientId) {
      this.fetchDietsForUser(this.clientId);
    }   
    
    this.setupLiveDateSearch()

  }



  // Helper method to parse a date string in "dd/mm/yyyy" format to a Date object.
  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }


// Helper to parse an ISO date string (YYYY-MM-DD) into a local Date.
parseISOToLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Updated filtering method using the new date format.
filterDietsByDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return this.transformedDiets;
  }

    // Parse the input dates in local time
    const start = this.parseISOToLocal(startDate);
    const end = this.parseISOToLocal(endDate);
  
    return this.transformedDiets.filter(diet => {
      // Convert the metric's "dd/mm/yyyy" string to a Date object.
      const dietDate = this.parseDate(diet.date);
      return dietDate >= start && dietDate <= end;
    });

}


// Live update subscription to the date inputs remains the same.
setupLiveDateSearch(): void {
  combineLatest([
    this.dateSearchForm.get('startDate')!.valueChanges,
    this.dateSearchForm.get('endDate')!.valueChanges
  ])
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(([startDate, endDate]) => {
      this.filteredDiets = this.filterDietsByDateRange(startDate ?? '', endDate ?? '');
      this.totalItems = this.filteredDiets.length; // update total items
      this.currentPage = 1; // reset to first page
      this.loadPage(this.currentPage);
    });
}




fetchDietsForUser(clientId: string): void {
  this.clientManagementService.getClientDetails(clientId).subscribe({
    next: (fetchedClientDetails: ClientProfile) => {
      this.clientName = fetchedClientDetails.fullName;
    }
  });
  
  this.dietService.fetchDietsForUser(clientId).subscribe({
    next: (response: any) => {
      console.log('API Response:', response);
      
      // Handle different response formats
      let fetchedDiets;
      if (response && response.data) {
        // If the API returns {data: [...]}
        fetchedDiets = response.data;
      } else if (Array.isArray(response)) {
        // If the API returns an array directly
        fetchedDiets = response;
      } else if (response) {
        // If the API returns a single object
        fetchedDiets = [response];
      } else {
        fetchedDiets = [];
      }
      
      this.diets = fetchedDiets;
      
      if (this.diets && this.diets.length > 0) {
        this.transformDiets();
        if (this.searchControl.value) {
          this.filteredDiets = this.filterDiets(this.searchControl.value);
        } else {
          this.filteredDiets = this.transformedDiets;
        }
        this.totalItems = this.filteredDiets.length;
        this.loadPage(this.currentPage);
      } else {
        console.log("No diets found for this user");
        this.transformedDiets = [];
        this.filteredDiets = [];
        this.pagedItems = [];
        this.totalItems = 0;
      }
    },
    error: (error: any) => {
      console.error("Error fetching diets:", error);
      this.transformedDiets = [];
      this.filteredDiets = [];
      this.pagedItems = [];
      this.totalItems = 0;
    }
  });
}







  formatDate(dateInput: string | Date): string {
    const dateObj = new Date(dateInput);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }



  transformDiets(): void {
    if (!this.diets || !Array.isArray(this.diets)) {
      console.warn('No diets data to transform');
      this.transformedDiets = [];
      return;
    }
  
    console.log('Transforming diets:', this.diets);
    
    this.transformedDiets = this.diets.map(diet => {
      // Add days info into a property that matches the HTML template expectations
      const typedDiet = diet as any; // Use type assertion to avoid TypeScript errors
      
      if (typedDiet.dietDays && !typedDiet.Days) {
        typedDiet.Days = typedDiet.dietDays.map((day: any) => {
          // Also normalize the meal structure
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
        fullDiet: typedDiet // Store the complete diet object with normalized structure
      };
    });
    
    console.log('Transformed diets:', this.transformedDiets);
  }
/////////////////////////////////////////////


  filterDiets(searchTerm: string) {
    if (!searchTerm) {
      return this.transformedDiets;
    }
    return this.transformedDiets.filter(diet =>
      diet.date.includes(searchTerm)
    );
  }

  onPageChanged(newPage: number) {
    this.currentPage = newPage;
    this.loadPage(newPage);
  }


  loadPage(page: number) {
    const start = (page - 1) * this.pageSize;
    // If you want the diets in reverse order, reverse them once here.
    const reversedDiets = [...this.filteredDiets].reverse();
    this.pagedItems = reversedDiets.slice(start, start + this.pageSize);
  
  ///////// TO CHANGE
  
  }


  openEditDietsModal(dietId: string): void {
    // Close the diet details modal if open
    this.closeDetails();
    
    // Open the edit modal
    const dialogRef = this.dialog.open(EditDietsComponent, {
      width: '90%',
      height: 'auto',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { dietId }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the diets if result is true (successful edit)
      if (result === true && this.clientId) {
        this.fetchDietsForUser(this.clientId);
      }
    });
  }



  openAddDietsModal(clientsId: string): void {
    const dialogRef = this.dialog.open(AddDietsComponent, {
      width: '90%', // Wider to accommodate the form
      height: 'auto',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { clientId: clientsId }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the diets if result is true (successful addition)
      if (result === true && this.clientId) {  
        this.fetchDietsForUser(this.clientId);
      }
    });
  }


  showDietDetails(diet: any) {
    console.log('Original diet object:', diet);
    
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
      
      console.log(`No diet days found in the data. Fetching detailed diet data with ID: ${dietId}...`);
      
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
        
        return; // Exit early, we'll process the diet after the API call
      }
    }
    
    // Process the diet data that we already have
    this.processSelectedDiet();
  }
  
  // New method to process the selected diet after it's been fetched or selected
  processSelectedDiet() {
    if (!this.selectedDiet) {
      console.error('No selected diet to process');
      return;
    }
    
    const typedDiet = this.selectedDiet as any;
    
    if (typedDiet.dateCreated && !typedDiet.date) {
      typedDiet.date = this.formatDate(typedDiet.dateCreated);
    }

    // Handle case where we have dietDays instead of Days
    if (typedDiet.dietDays && (!typedDiet.Days || typedDiet.Days.length === 0)) {
      console.log('Found dietDays - normalizing structure');
      typedDiet.Days = typedDiet.dietDays.map((day: any) => {
        const normalizedDay = { ...day };
        console.log('Day structure:', normalizedDay);
        
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
      console.log('Found diet days in lowercase "days" property');
      typedDiet.Days = typedDiet.days;
    }
    
    console.log('Selected diet after processing:', this.selectedDiet);
    
    // Log the days array for debugging
    const days = typedDiet.Days || [];
    console.log('Diet days:', days);
    
    if (days && days.length > 0) {
      const firstDay = days[0];
      console.log('First day:', firstDay);
      console.log('First day meals:', firstDay.Meals || firstDay.dietMeals || []);
      
      // Print out all meals for debugging
      days.forEach((day: any, index: number) => {
        console.log(`Day ${index + 1} (${day.dayName || 'Unknown'}):`);
        const meals = day.Meals || day.dietMeals || [];
        if (meals.length > 0) {
          meals.forEach((meal: any) => {
            console.log(`- ${meal.Type || meal.mealType || 'Unknown meal'}: ${meal.Meal || meal.meal || '[empty]'}`);
          });
        } else {
          console.log('- No meals found for this day');
        }
      });
    } else {
      console.log('No days found or days array is empty');
    }
  }
    
    closeDetails(): void {
      this.selectedDiet = null;
    }



showDeleteConfirmation = false;
dietToDeleteId: string | null = null;
deleteSuccessMessage: string | null = null;



openDeleteConfirmation(dietId: string, event?: Event): void {
  if (event) {
    event.stopPropagation(); // Prevent row click event from firing only if event is provided
  }
  this.dietToDeleteId = dietId;
  this.showDeleteConfirmation = true;
}



cancelDelete(): void {
  this.showDeleteConfirmation = false;
  this.dietToDeleteId = null;
  this.deleteSuccessMessage = null;
}

confirmDelete(): void {
  if (this.dietToDeleteId) {
    this.dietService.deleteDiet(this.dietToDeleteId).subscribe({
      next: () => {
        // Close both popup windows immediately
        this.selectedDiet = null; // Close the details modal if open
        this.showDeleteConfirmation = false; // Close the confirmation dialog
        
        this.deleteSuccessMessage = "Diet deleted successfully!";
        
        // Remove the deleted diet from the arrays
        this.diets = this.diets.filter(diet => diet.id !== this.dietToDeleteId);
        this.transformDiets(); // Refresh the transformed diets
        this.filteredDiets = this.transformedDiets;
        this.totalItems = this.filteredDiets.length;
        this.loadPage(this.currentPage);
        
        // Clear the deletion-related variables after a delay
        setTimeout(() => {
          this.dietToDeleteId = null;
          this.deleteSuccessMessage = null;
        }, 1500);
      },
      error: (error) => {
        console.error("Error deleting diet:", error);
        // Close the confirmation dialog on error too
        this.showDeleteConfirmation = false;
      }
    });
  }
}


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



downloadDietPdf(): void {
  if (!this.selectedDiet) return;
  
  console.log('Downloading diet as PDF:', this.selectedDiet);
  
  const dietTable = document.querySelector('.horizontal-diet-table') as HTMLElement;
  if (!dietTable) {
    console.error('Could not find diet table element');
    alert('Error generating PDF: Table not found');
    return;
  }
  
  html2canvas(dietTable).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
    pdf.save(`diet-${this.selectedDiet.name}.pdf`);
  }).catch(error => {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF');
  });
}








}