import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MetricsService } from '../../../services/metrics.service';
import { Metrics } from '../../../models/metrics/metrics';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { ClientManagementService } from '../../../services/client-management.service';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EditMetricsComponent } from '../edit-metrics/edit-metrics.component';
import { AddMetricsComponent } from '../add-metrics/add-metrics.component';
import { ReactiveFormErrorComponent } from "../../../components/reactive-form-error/reactive-form-error.component";
import { PaginationComponent } from '../../pagination/pagination.component';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'view-metrics',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PaginationComponent],
  templateUrl: './view-metrics.component.html',
  styleUrls: ['./view-metrics.component.css']
})
export class ViewMetricsComponent implements OnInit {

  isConfirmationWindowVisible = false;
  clientName!:string;
  clientId!: string;
  errorMessage: string = "";
  metrics!: Metrics[];
  transformedMetrics: { id: any; date: any; data: { title: string, value: number, unit: string }[] }[] = [];
  filteredMetrics: { id: any; date: any; data: { title: string, value: number, unit: string }[] }[] = [];
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
  pagedItems:{ id: any; date: any; data: { title: string, value: number, unit: string }[] }[] = [];
  dateSearchForm = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl('')
  });
  
  metricsService = inject(MetricsService);
  clientManagementService = inject(ClientManagementService);


  
  constructor(private dialog: MatDialog, private route: ActivatedRoute, private router:Router) {}
  ngOnInit(): void {
    this.loadPage(this.currentPage);


    this.clientId = this.route.snapshot.paramMap.get('clientId')!;
    if (this.clientId) {
      this.fetchMetricsForUser(this.clientId);
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
filterMetricsByDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return this.transformedMetrics;
  }

  // Parse the input dates in local time
  const start = this.parseISOToLocal(startDate);
  const end = this.parseISOToLocal(endDate);

  return this.transformedMetrics.filter(metric => {
    // Convert the metric's "dd/mm/yyyy" string to a Date object.
    const metricDate = this.parseDate(metric.date);
    return metricDate >= start && metricDate <= end;
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
      this.filteredMetrics = this.filterMetricsByDateRange(startDate ?? '', endDate ?? '');
      this.totalItems = this.filteredMetrics.length; // update total items
      this.currentPage = 1; // reset to first page
      this.loadPage(this.currentPage);
    });
}
  

  fetchMetricsForUser(clientId: string): void {
     this.clientManagementService.getClientDetails(clientId).subscribe({
          next: (fetchedClientDetails:ClientProfile) =>{
            this.clientName = fetchedClientDetails.fullName;

          }
          
        })
        this.metricsService.fetchMetricsForUser(clientId).subscribe({
          next: (fetchedMetrics) => {
            this.metrics = fetchedMetrics;
            this.transformMetrics();
            if (this.searchControl.value) {
              this.filteredMetrics = this.filterMetrics(this.searchControl.value);
            } else {
              this.filteredMetrics = this.transformedMetrics;
            }
            this.totalItems = this.filteredMetrics.length;
            this.loadPage(this.currentPage);
          },
          error: (error: any) => {
            console.error("Error fetching metrics:", error);
            this.loadPage(this.currentPage);
            this.filteredMetrics = this.pagedItems = [];
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

  transformMetrics(): void {
    if (!this.metrics || this.metrics.length === 0) {
      console.error("Metrics data is empty or undefined.");
      this.transformedMetrics = [];
      return;
    }
  
    this.transformedMetrics = this.metrics.map(metric => ({
      id: metric.id,
      // Store date in YYYY-MM-DD format, which is compatible with the date input value.
      date: this.formatDate(metric.dateCreated),  // "24/03/2025" format
      data: [
        { title: 'Bodyweight', value: metric.bodyweight, unit: 'kg' },
        { title: 'Fat Mass', value: metric.fatMass, unit: '%' },
        { title: 'Muscle Mass', value: metric.muscleMass, unit: 'kg' }
      ]
    }));
  }
  

  filterMetrics(searchTerm: string) {
    if (!searchTerm) {
      return this.transformedMetrics;
    }
    return this.transformedMetrics.filter(metric =>
      metric.date.includes(searchTerm)
    );
  }

  onPageChanged(newPage: number) {
    this.currentPage = newPage;
    this.loadPage(newPage);
  }

  loadPage(page: number) {
    const start = (page - 1) * this.pageSize;
    // If you want the metrics in reverse order, reverse them once here.
    const reversedMetrics = [...this.filteredMetrics].reverse();
    this.pagedItems = reversedMetrics.slice(start, start + this.pageSize);
  }
    
  openEditMetricsModal(metricId: string): void {
    const dialogRef = this.dialog.open(EditMetricsComponent, {
      width: '150%',
      height: 'auto',
      maxWidth: '1000px',
      maxHeight: '100vh',
      data: { metricId }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the metrics after the modal is closed
      if (this.clientId) {
        this.fetchMetricsForUser(this.clientId);
        
      }
    });
  }

  openAddMetricsModal(clientsId: string): void{
    const dialogRef = this.dialog.open(AddMetricsComponent, {
      width: '150%',
      height: 'auto',
      maxWidth: '1000px',
      maxHeight: '100vh',
      data: { clientId:clientsId }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Refresh the metrics after the modal is closed
      if (this.clientId) {  
        this.fetchMetricsForUser(this.clientId);
      }
    });
  }
  
}