import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MetricsService } from '../../../services/metrics.service';
import { Metrics } from '../../../models/metrics/metrics';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { ClientManagementService } from '../../../services/client-management.service';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EditMetricsComponent } from '../edit-metrics/edit-metrics.component';
import { AddMetricsComponent } from '../add-metrics/add-metrics.component';
import { ReactiveFormErrorComponent } from "../../../components/reactive-form-error/reactive-form-error.component";
import { PaginationComponent } from '../../pagination/pagination.component';

@Component({
  selector: 'view-metrics',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, ReactiveFormErrorComponent, PaginationComponent],
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

  metricsService = inject(MetricsService);
  clientManagementService = inject(ClientManagementService);


  
  constructor(private dialog: MatDialog, private route: ActivatedRoute, private router:Router) {}
  ngOnInit(): void {
    this.loadPage(this.currentPage);


    this.clientId = this.route.snapshot.paramMap.get('clientId')!;
    if (this.clientId) {
      this.fetchMetricsForUser(this.clientId);
    }

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filteredMetrics = this.filterMetrics(searchTerm!);
      this.totalItems = this.filteredMetrics.length; // update total items count
      this.currentPage = 1; // reset to first page
      this.loadPage(1);
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
            
          }
    });
  }

  transformMetrics(): void {
    if (!this.metrics || this.metrics.length === 0) {
      console.error("Metrics data is empty or undefined.");
      this.transformedMetrics = [];
      return;
    }
  
    this.transformedMetrics = this.metrics.map(metric => ({
      id: metric.id, // Ensure the metric ID is included
      date: new Date(metric.dateCreated).toLocaleDateString(),  // Group by date 
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
        if (this.metrics[0].id == "default"){
          console.log("Hello My friends");
          this.totalItems = 0;
        }
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