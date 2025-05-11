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

import { ReviewsService } from '../../../services/reviews.service';
import { AccountService } from '../../../services/account.service';
import { Location } from '@angular/common';


@Component({
  selector: 'view-diets',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PaginationComponent, CommonModule],
  templateUrl: './view-diets.component.html',
  styleUrls: ['./view-diets.component.css']
})


export class ViewDietsComponent implements OnInit {
  // User authorization properties
  role!: string; // Stores the current user role (admin, dietitian, client)
  
  // Form related properties
  isEditMode = false;
  editDietForm: FormGroup = new FormGroup({});
  successMessage: string | null = null;
  
  // Modal display control properties
  showDietDetailsModal = false;
  selectedDiet: any = null;

  // Confirmation dialog properties
  isConfirmationWindowVisible = false;
  clientName!:string; // Stores the name of the client whose diets are being viewed
  clientId!: string; // Stores the ID of the client whose diets are being viewed
  errorMessage: string = "";

  // Diet data storage properties
  diets!: Diet[]; // Original diet data from API
  transformedDiets: { id: any; date: any ; name: any; isTemplate: any }[] = []; // Transformed diet data for display
  filteredDiets: { id: any; name: any; isTemplate: any ; date:any }[] = []; // Filtered diet data based on search
  searchControl = new FormControl(''); // Form control for search input

  // Form validation properties
  showErrorOnControlTouched!: boolean;
  errorMessages!: Map<string,string>;
  showErrorOnControlDirty!: boolean;
  type: any;
  placeholder: any;
  control!: FormControl<any>;

  // Pagination properties
  totalItems = 100;   // Total number of items available
  pageSize = 10;      // Number of items per page
  currentPage = 1;    // Current active page
  items = [/* array of data */];

  // Pagination data - current page items
  pagedItems:{ id: any; name: any; isTemplate: any ; date:any }[] = [];
  
  // Date search form
  dateSearchForm = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl('')
  });

  // Service injections using the inject pattern
  dietService = inject(DietService);
  clientManagementService = inject(ClientManagementService);

  // Constructor with dependency injection
  constructor(
    private accountService: AccountService, 
    private reviewsService: ReviewsService,
    private dialog: MatDialog, 
    private route: ActivatedRoute, 
    private router:Router,   
    private location: Location
  ) {}
 
  // Lifecycle hook - component initialization
  ngOnInit(): void {
    // Get user role from account service with fallback to empty string
    const role = this.accountService.userRole() ?? '';
    this.role = role;
    this.loadPage(this.currentPage);
  
    if (this.role === "admin") {
      // Admin flow: Get client ID from route parameters
      this.clientId = this.route.snapshot.paramMap.get('clientId')!;
      this.fetchDietsForUser(this.clientId);
    } else {
      // Client flow: Get logged-in user's ID and fetch their diets
      this.reviewsService.getLoggedInUserId().subscribe({
        next: (userId: string) => {
          // console.log('User ID:', userId);
          this.clientId = userId;
          this.fetchDietsForUser(this.clientId);
        },
        error: (error: any) => console.error('Error getting user ID:', error)
      });
    }
  
    // Setup real-time date filtering
    this.setupLiveDateSearch();
  }

  // Helper method to get current user ID
  getUserId() {
    this.reviewsService.getLoggedInUserId().subscribe({
      next: (userId: string) => {
        // console.log('User ID:', userId);
        // Use userId here
      },
      error: (error: any) => console.error('Error getting user ID:', error)
    });
  }

  // Helper method to convert DD/MM/YYYY string to Date object
  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  // Helper to convert ISO date format (YYYY-MM-DD) to JavaScript Date object
  parseISOToLocal(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Filter diets based on date range selection
  filterDietsByDateRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      return this.transformedDiets;
    }

    // Parse the input dates in local time
    const start = this.parseISOToLocal(startDate);
    const end = this.parseISOToLocal(endDate);
  
    return this.transformedDiets.filter(diet => {
      // Convert the diet's "dd/mm/yyyy" string to a Date object for comparison
      const dietDate = this.parseDate(diet.date);
      return dietDate >= start && dietDate <= end;
    });
  }

  // Setup real-time filtering as user selects date ranges
  setupLiveDateSearch(): void {
    combineLatest([
      this.dateSearchForm.get('startDate')!.valueChanges,
      this.dateSearchForm.get('endDate')!.valueChanges
    ])
      .pipe(
        debounceTime(300), // Wait for user to stop typing
        distinctUntilChanged() // Only emit when values change
      )
      .subscribe(([startDate, endDate]) => {
        this.filteredDiets = this.filterDietsByDateRange(startDate ?? '', endDate ?? '');
        this.totalItems = this.filteredDiets.length; // update total items
        this.currentPage = 1; // reset to first page
        this.loadPage(this.currentPage);
      });
  }

  // Fetch diets for a specific user/client from the API
  fetchDietsForUser(clientId: string): void {
    // First get client details to display client name
    this.clientManagementService.getClientDetails(clientId).subscribe({
      next: (fetchedClientDetails: ClientProfile) => {
        this.clientName = fetchedClientDetails.fullName;
      }
    });
    
    // Then fetch the diets for this client
    this.dietService.fetchDietsForUser(clientId).subscribe({
      next: (response: any) => {
        // console.log('API Response:', response);
        
        // Handle different response formats from API
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

        // Filter out diets with invalid userDiets entries
        fetchedDiets = fetchedDiets.filter((diet: { userDiets: any[]; }) => {
          // Skip diets with no userDiets array
          if (!diet.userDiets || !Array.isArray(diet.userDiets)) return false;
          
          // Keep only diets where no userDiet has an empty userID (all zeros)
          return !diet.userDiets.some(userDiet => 
            userDiet.dietId === '00000000-0000-0000-0000-000000000000' );
        });
      
        this.diets = fetchedDiets;
        
        // Process diets if we got any
        if (this.diets && this.diets.length > 0) {
          this.transformDiets(); // Transform diets for display
          
          // Apply search filter if active
          if (this.searchControl.value) {
            this.filteredDiets = this.filterDiets(this.searchControl.value);
          } else {
            this.filteredDiets = this.transformedDiets;
          }
          
          this.totalItems = this.filteredDiets.length;
          this.loadPage(this.currentPage); // Load current page of results
        } else {
          // Handle case with no diets
          // console.log("No diets found for this user");
          this.transformedDiets = [];
          this.filteredDiets = [];
          this.pagedItems = [];
          this.totalItems = 0;
        }
      },
      error: (error: any) => {
        console.error("Error fetching diets:", error);
        // Reset arrays on error
        this.transformedDiets = [];
        this.filteredDiets = [];
        this.pagedItems = [];
        this.totalItems = 0;
      }
    });
  }

  // Print the selected diet plan
  printDiet(): void {
    if (!this.selectedDiet) return;
    
    // Format current date for printing
    const printDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    
    // Set client name and attributes for printing
    const clientNameElement = document.querySelector('.meal-type-header');
    if (clientNameElement) {
      clientNameElement.textContent = this.clientName || 'Diet Plan';
      clientNameElement.setAttribute('data-original-content', clientNameElement.textContent);
    }
    
    // Set attributes on modal content and force single page printing
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.setAttribute('data-print-date', printDate);
      modalContent.setAttribute('data-diet-name', this.selectedDiet.name || 'Diet Plan');
      // Force single page printing without any height restrictions
      modalContent.setAttribute('style', 'page-break-inside: avoid !important; max-height: none !important; overflow: visible !important; height: auto !important; width: 100% !important;');
    }
    
    // Hide footer elements during printing
    const footers = document.querySelectorAll('app-page-footer, footer, .page-footer, .app-footer');
    footers.forEach(footer => {
      if (footer instanceof HTMLElement) {
        footer.style.display = 'none';
      }
    });
    
    // Get the diet table and optimize for single page
    const dietTable = document.querySelector('.horizontal-diet-table');
    if (dietTable && dietTable instanceof HTMLElement) {
      // Add class for print optimization
      dietTable.classList.add('print-optimize');
      
      // Calculate content density more accurately
      const cells = dietTable.querySelectorAll('td');
      let totalLength = 0;
      
      cells.forEach(cell => {
        totalLength += cell.textContent?.length || 0;
      });
      
      // Dynamic font scaling based on content length - adjust font size based on content density
      if (totalLength > 10000) {
        dietTable.style.fontSize = '3px';
        dietTable.style.lineHeight = '0.6';
      } else if (totalLength > 8000) {
        dietTable.style.fontSize = '4px';
        dietTable.style.lineHeight = '0.7';
      } else if (totalLength > 5000) {
        dietTable.style.fontSize = '5px';
        dietTable.style.lineHeight = '0.8';
      } else if (totalLength > 3000) {
        dietTable.style.fontSize = '7px';
        dietTable.style.lineHeight = '0.9';
      } else if (totalLength > 2000) {
        dietTable.style.fontSize = '9px';
        dietTable.style.lineHeight = '1.0';
      } else {
        dietTable.style.fontSize = '12px';
        dietTable.style.lineHeight = '1.4';
      }

      // Force table to fit on one page
      dietTable.style.pageBreakInside = 'avoid';
      dietTable.style.width = '100%';
      dietTable.style.tableLayout = 'fixed';
      
      // Adjust cell padding based on content density
      const tdElements = dietTable.querySelectorAll('td');
      tdElements.forEach(td => {
        if (td instanceof HTMLElement) {
          if (totalLength > 8000) {
            td.style.padding = '0';
            td.style.wordBreak = 'keep-all'; // Preserve word formation
          } else if (totalLength > 5000) {
            td.style.padding = '0';
            td.style.wordBreak = 'keep-all';
          } else if (totalLength > 3000) {
            td.style.padding = '1px';
            td.style.wordBreak = 'keep-all';
          } else if (totalLength > 1500) {
            td.style.padding = '2px';
          } else {
            td.style.padding = '4px';
          }
        }
      });
      
      // Adjust header cell height
      const thElements = dietTable.querySelectorAll('th');
      thElements.forEach(th => {
        if (th instanceof HTMLElement) {
          if (totalLength > 3000) {
            th.style.height = '18px';
            th.style.padding = '0';
          }
        }
      });
    }
    
    // Remove ALL scrollbars for printing
    // Start by handling container elements
    const tableContainer = document.querySelector('.horizontal-diet-table-container');
    if (tableContainer && tableContainer instanceof HTMLElement) {
      tableContainer.style.overflow = 'visible';
      tableContainer.style.maxHeight = 'none';
      tableContainer.style.height = 'auto';
      tableContainer.style.width = '100%';
    }
    
    // Find ALL potentially scrollable elements and make them visible for print
    const scrollableElements = document.querySelectorAll('.modal-content, .diet-details-modal, [style*="overflow"], div, section');
    scrollableElements.forEach(elem => {
      if (elem instanceof HTMLElement) {
        elem.style.overflow = 'visible';
        elem.style.maxHeight = 'none';
        elem.style.height = 'auto';
      }
    });
    
    // Add print-specific CSS to force single page
    let printStyle = document.getElementById('print-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'print-style';
      document.head.appendChild(printStyle);
    }
    printStyle.textContent = `
      @media print {
        html, body {
          height: auto !important;
          overflow: visible !important;
        }
        * {
          overflow: visible !important;
        }
        .horizontal-diet-table {
          page-break-inside: avoid !important;
        }
        @page {
          size: landscape;
          margin: 10mm !important;
        }
      }
    `;
    
    // Print with delay to ensure DOM updates
    setTimeout(() => {
      window.print();
      
      // Restore original content after printing
      if (clientNameElement && clientNameElement.hasAttribute('data-original-content')) {
        clientNameElement.textContent = clientNameElement.getAttribute('data-original-content');
      }
      
      // Restore footers
      footers.forEach(footer => {
        if (footer instanceof HTMLElement) {
          footer.style.display = '';
        }
      });
      
      // Restore table styling
      if (dietTable && dietTable instanceof HTMLElement) {
        dietTable.classList.remove('print-optimize');
        dietTable.style.fontSize = '';
        dietTable.style.lineHeight = '';
        dietTable.style.pageBreakInside = '';
        dietTable.style.width = '';
        dietTable.style.tableLayout = '';
        
        // Restore cell padding and word break
        const tdElements = dietTable.querySelectorAll('td');
        tdElements.forEach(td => {
          if (td instanceof HTMLElement) {
            td.style.padding = '';
            td.style.wordBreak = '';
          }
        });
        
        // Restore header styling
        const thElements = dietTable.querySelectorAll('th');
        thElements.forEach(th => {
          if (th instanceof HTMLElement) {
            th.style.height = '';
            th.style.padding = '';
          }
        });
      }
      
      // Restore scrollable elements
      if (tableContainer && tableContainer instanceof HTMLElement) {
        tableContainer.style.overflow = '';
        tableContainer.style.maxHeight = '';
        tableContainer.style.height = '';
        tableContainer.style.width = '';
      }
      
      scrollableElements.forEach(elem => {
        if (elem instanceof HTMLElement) {
          elem.style.overflow = '';
          elem.style.maxHeight = '';
          elem.style.height = '';
        }
      });
      
      // Remove print-specific CSS
      if (printStyle) {
        printStyle.textContent = '';
      }
      
      // Restore modal content
      if (modalContent) {
        modalContent.removeAttribute('style');
      }
    }, 200);
  }

  // Format date to DD/MM/YYYY string format
  formatDate(dateInput: string | Date): string {
    const dateObj = new Date(dateInput);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Transform raw diet data from API into format needed for the UI
  transformDiets(): void {
    if (!this.diets || !Array.isArray(this.diets)) {
      console.warn('No diets data to transform');
      this.transformedDiets = [];
      return;
    }
  
    // console.log('Transforming diets:', this.diets);
    
    this.transformedDiets = this.diets.map(diet => {
      // Add days info into a property that matches the HTML template expectations
      const typedDiet = diet as any; // Use type assertion to avoid TypeScript errors
      
      // Normalize diet days structure for consistent access in template
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
      
      // Return simplified diet object for list display
      return {
        id: typedDiet.id,
        date: this.formatDate(typedDiet.dateCreated),
        name: typedDiet.name,
        isTemplate: typedDiet.isTemplate,
        fullDiet: typedDiet // Store the complete diet object with normalized structure
      };
    });
    
    // console.log('Transformed diets:', this.transformedDiets);
  }

  // Filter diets based on search term
  filterDiets(searchTerm: string) {
    if (!searchTerm) {
      return this.transformedDiets;
    }
    return this.transformedDiets.filter(diet =>
      diet.date.includes(searchTerm)
    );
  }

  // Handle pagination page change
  onPageChanged(newPage: number) {
    this.currentPage = newPage;
    this.loadPage(newPage);
  }

  // Load specific page of diet items
  loadPage(page: number) {
    const start = (page - 1) * this.pageSize;
    // Reverse diets to show newest first
    const reversedDiets = [...this.filteredDiets].reverse();
    this.pagedItems = reversedDiets.slice(start, start + this.pageSize);
  }

  // Open the edit diet dialog
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

  // Open the add diet dialog
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

  // Display detailed view of a diet
  showDietDetails(diet: any) {
    // console.log('Original diet object:', diet);
    
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
      
      // console.log(`No diet days found in the data. Fetching detailed diet data with ID: ${dietId}...`);
      
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
  
  // Process the selected diet data for consistent structure
  processSelectedDiet() {
    if (!this.selectedDiet) {
      console.error('No selected diet to process');
      return;
    }
    
    const typedDiet = this.selectedDiet as any;
    
    // Normalize date format
    if (typedDiet.dateCreated && !typedDiet.date) {
      typedDiet.date = this.formatDate(typedDiet.dateCreated);
    }

    // Handle case where we have dietDays instead of Days
    if (typedDiet.dietDays && (!typedDiet.Days || typedDiet.Days.length === 0)) {
      // console.log('Found dietDays - normalizing structure');
      typedDiet.Days = typedDiet.dietDays.map((day: any) => {
        const normalizedDay = { ...day };
        // console.log('Day structure:', normalizedDay);
        
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
      // console.log('Found diet days in lowercase "days" property');
      typedDiet.Days = typedDiet.days;
    }
    
    // console.log('Selected diet after processing:', this.selectedDiet);
    
    // Log the days array for debugging
    const days = typedDiet.Days || [];
    // console.log('Diet days:', days);
    
    if (days && days.length > 0) {
      const firstDay = days[0];
      // console.log('First day:', firstDay);
      // console.log('First day meals:', firstDay.Meals || firstDay.dietMeals || []);
      
      // Print out all meals for debugging
      days.forEach((day: any, index: number) => {
        // console.log(`Day ${index + 1} (${day.dayName || 'Unknown'}):`);
        const meals = day.Meals || day.dietMeals || [];
        if (meals.length > 0) {
          meals.forEach((meal: any) => {
            // console.log(`- ${meal.Type || meal.mealType || 'Unknown meal'}: ${meal.Meal || meal.meal || '[empty]'}`);
          });
        } else {
          // console.log('- No meals found for this day');
        }
      });
    } else {
      // console.log('No days found or days array is empty');
    }
  }
    
  // Close the diet details modal
  closeDetails(): void {
    this.selectedDiet = null;
  }

  // Delete confirmation state variables
  showDeleteConfirmation = false;
  dietToDeleteId: string | null = null;
  deleteSuccessMessage: string | null = null;

  // Open the delete confirmation dialog
  openDeleteConfirmation(dietId: string, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent row click event from firing only if event is provided
    }
    this.dietToDeleteId = dietId;
    this.showDeleteConfirmation = true;
  }

  // Cancel diet deletion
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.dietToDeleteId = null;
    this.deleteSuccessMessage = null;
  }

  // Confirm and execute diet deletion
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

  // Get meal content for a specific day and meal type
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

  // Get meal content from array by meal type with fallbacks
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

  // Navigation - go back to previous page
  goBack(): void {
    this.location.back();
  }
}