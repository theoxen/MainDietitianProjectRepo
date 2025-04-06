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

@Component({
  selector: 'view-diets',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PaginationComponent],
  templateUrl: './view-diets.component.html',
  styleUrls: ['./view-diets.component.css']
})



export class ViewDietsComponent implements OnInit {

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
  if (!this.diets || !Array.isArray(this.diets) || this.diets.length === 0) {
    console.log("Diets data is empty or not an array:", this.diets);
    this.transformedDiets = [];
    return;
  }

  try {
    this.transformedDiets = this.diets.map(diet => ({
      id: diet.id || '',
      date: this.formatDate(diet.dateCreated || new Date()),
      name: diet.name || 'Unnamed Diet',
      isTemplate: diet.isTemplate || false,
      data: [
        { title: 'Name', value: diet.name || 'Unnamed Diet' },
        { title: 'Is Template', value: diet.isTemplate ? 'Yes' : 'No' }
      ],
      // Store the full diet object for displaying details
      fullDiet: diet
    }));
  } catch (error) {
    console.error("Error transforming diets:", error, this.diets);
    this.transformedDiets = [];
  }
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
    const dialogRef = this.dialog.open(EditDietsComponent, {
      width: '150%',
      height: 'auto',
      maxWidth: '1000px',
      maxHeight: '100vh',
      data: { dietId }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the metrics after the modal is closed
      if (this.clientId) {
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


    showDietDetails(diet: any): void {
      this.selectedDiet = diet;
      event?.stopPropagation(); // Prevent triggering parent click events
    }
    
    closeDetails(): void {
      this.selectedDiet = null;
    }



}