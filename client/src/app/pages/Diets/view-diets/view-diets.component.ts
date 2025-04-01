import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DietService } from '../../../services/diet.service';
import { Diet } from '../../../models/diet';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { ClientManagementService } from '../../../services/client-management.service';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, combineLatest } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EditDietComponent } from '../edit-diet/edit-diet.component';
import { AddDietComponent } from '../add-diet/add-diet.component';
import { PaginationComponent } from '../../pagination/pagination.component';

@Component({
  selector: 'view-diets',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PaginationComponent],
  templateUrl: './view-diets.component.html',
  styleUrls: ['./view-diets.component.css']
})
export class ViewDietsComponent implements OnInit {

  isConfirmationWindowVisible = false;
  clientName!: string;
  clientId!: string;
  errorMessage: string = "";
  
  diets!: Diet[];
  transformedDiets: { id: any; date: string; name: string }[] = [];
  filteredDiets: { id: any; date: string; name: string }[] = [];
  searchControl = new FormControl('');
  
  totalItems = 100;
  pageSize = 10;
  currentPage = 1;
  pagedItems: { id: any; date: string; name: string }[] = [];
  
  dateSearchForm = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl('')
  });
  
  dietService = inject(DietService);
  clientManagementService = inject(ClientManagementService);
  
  constructor(private dialog: MatDialog, private route: ActivatedRoute, private router: Router) {}
  
  ngOnInit(): void {
    this.loadPage(this.currentPage);

    // Assuming that diets are loaded for a given client.
    this.clientId = this.route.snapshot.paramMap.get('clientId')!;
    if (this.clientId) {
      this.fetchDietsForUser(this.clientId);
    }
    
    this.setupLiveDateSearch();
  }
  
  // Assume that diet.dateCreated is stored as a Date or ISO string.
  formatDate(dateInput: string | Date): string {
    const dateObj = new Date(dateInput);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // We use parseDate to convert a "dd/mm/yyyy" string into a Date.
  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }
  
  // We assume the date input (from the date picker) is in "YYYY-MM-DD"
  parseISOToLocal(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Filter diets by a date range using the formatted date string.
  filterDietsByDateRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      return this.transformedDiets;
    }
    const start = this.parseISOToLocal(startDate);
    const end = this.parseISOToLocal(endDate);
  
    return this.transformedDiets.filter(diet => {
      const dietDate = this.parseDate(diet.date);
      return dietDate >= start && dietDate <= end;
    });
  }
  
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
        this.totalItems = this.filteredDiets.length;
        this.currentPage = 1;
        this.loadPage(this.currentPage);
      });
  }
  
  fetchDietsForUser(clientId: string): void {
    // Fetch client details, e.g., to display client name
    this.clientManagementService.getClientDetails(clientId).subscribe({
      next: (fetchedClientDetails: ClientProfile) => {
        this.clientName = fetchedClientDetails.fullName;
      }
    });
    // Fetch diets for the client using DietService.
    this.dietService.fetchDietsForUser(clientId).subscribe({
      next: (fetchedDiets) => {
        this.diets = fetchedDiets;
        this.transformDiets();
        if (this.searchControl.value) {
          this.filteredDiets = this.filterDiets(this.searchControl.value);
        } else {
          this.filteredDiets = this.transformedDiets;
        }
        this.totalItems = this.filteredDiets.length;
        this.loadPage(this.currentPage);
      },
      error: (error: any) => {
        console.error("Error fetching diets:", error);
        this.loadPage(this.currentPage);
        this.filteredDiets = this.pagedItems = [];
      }
    });
  }
  
  transformDiets(): void {
    if (!this.diets || this.diets.length === 0) {
      console.error("Diets data is empty or undefined.");
      this.transformedDiets = [];
      return;
    }
  
    this.transformedDiets = this.diets.map(diet => ({
      id: diet.id,
      // Format the created date into "dd/mm/yyyy"
      date: this.formatDate(diet.dateCreated),
      name: diet.name
    }));
  }
  
  filterDiets(searchTerm: string) {
    if (!searchTerm) {
      return this.transformedDiets;
    }
    return this.transformedDiets.filter(diet =>
      diet.date.includes(searchTerm) || diet.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  onPageChanged(newPage: number) {
    this.currentPage = newPage;
    this.loadPage(newPage);
  }
  
  loadPage(page: number) {
    const start = (page - 1) * this.pageSize;
    const reversedDiets = [...this.filteredDiets].reverse();
    this.pagedItems = reversedDiets.slice(start, start + this.pageSize);
  }
  
  openEditDietModal(dietId: string): void {
    const dialogRef = this.dialog.open(EditDietComponent, {
      width: '150%',
      height: 'auto',
      maxWidth: '1000px',
      maxHeight: '100vh',
      data: { dietId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (this.clientId) {
        this.fetchDietsForUser(this.clientId);
      }
    });
  }
  
  openAddDietModal(clientId: string): void {
    const dialogRef = this.dialog.open(AddDietComponent, {
      width: '150%',
      height: 'auto',
      maxWidth: '1000px',
      maxHeight: '100vh',
      data: { clientId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (this.clientId) {  
        this.fetchDietsForUser(this.clientId);
      }
    });
  }
}
