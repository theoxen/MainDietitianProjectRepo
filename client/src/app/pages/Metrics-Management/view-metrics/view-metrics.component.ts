import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MetricsService } from '../../../services/metrics.service';
import { Metrics } from '../../../models/metrics/metrics';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { MetricCardComponent } from '../metric-card/metric-card.component';
import { ClientManagementService } from '../../../services/client-management.service';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";


@Component({
  selector: 'view-metrics',
  standalone: true,
  imports: [NavBarComponent, MetricCardComponent, ReactiveFormsModule, RouterLink, PrimaryInputFieldComponent],
  templateUrl: './view-metrics.component.html',
  styleUrls: ['./view-metrics.component.css']
})
export class ViewMetricsComponent implements OnInit {

  isConfirmationWindowVisible = false;
  clientName!:string;
  clientId?: string;
  errorMessage: string = "";
  metrics!: Metrics[];
  transformedMetrics: { id: any; date: any; data: { title: string, value: number, unit: string }[] }[] = [];
  filteredMetrics: { id: any; date: any; data: { title: string, value: number, unit: string }[] }[] = [];
  searchControl = new FormControl('');


  metricsService = inject(MetricsService);
  clientManagementService = inject(ClientManagementService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    window.scrollTo(0, 0); // Scroll to the top of the page

    this.clientId = this.route.snapshot.paramMap.get('clientId')!;
    if (this.clientId) {
      
      this.fetchMetricsForUser(this.clientId);
    }

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filteredMetrics = this.filterMetrics(searchTerm!);
    });
  }

  fetchMetricsForUser(clientId: string): void {
    this.metricsService.fetchMetricsForUser(clientId).subscribe({
      next: (fetchedMetrics) => {
        this.clientManagementService.getClientDetails(clientId).subscribe({
          next: (fetchedClientDetails:ClientProfile) =>{
            this.clientName = fetchedClientDetails.fullName;
          }
          
        })
        this.metrics = fetchedMetrics;
        this.transformMetrics();
        this.filteredMetrics = this.transformedMetrics; 

      },
      error: (error: any) => {
        this.errorMessage = "Error fetching metrics. Please try again later.";
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
}