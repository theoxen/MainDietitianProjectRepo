import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MetricsService } from '../../../services/metrics.service';
import { Metrics } from '../../../models/metrics/metrics';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { MetricCardComponent } from '../metric-card/metric-card.component';
import { ClientManagementService } from '../../../services/client-management.service';
import { User } from '../../../models/user';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { ValidationMessages } from '../../../validation/validation-messages';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { CustomValidators } from '../../../validation/CustomValidators';
import { MetricsToEdit } from '../../../models/metrics/metrics-to-edit';


@Component({
  selector: 'edit-metrics',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PrimaryInputFieldComponent],
  templateUrl: './edit-metrics.component.html',
  styleUrls: ['./edit-metrics.component.css']
})
export class EditMetricsComponent implements OnInit {

  isConfirmationWindowVisible = false;
  clientName!: string;
  metricsId?: string;
  errorMessage: string = "";
  metrics!: Metrics[];
  userId!:string;
  dateCreatedString!:string;
  dateCreated!:Date;
  transformedMetrics: { id: any; date: any; data: { title: string, value: number, unit: string }[] }[] = [];
  filteredMetrics: { id: any; date: any; data: { title: string, value: number, unit: string }[] }[] = [];
  searchControl = new FormControl('');

  metricsService = inject(MetricsService);
  clientManagementService = inject(ClientManagementService);

addclientMetricsForm = new FormGroup({
    "bodyweight": new FormControl("", [
      Validators.pattern(ValidationPatterns.bodyweight),
      Validators.required,
      CustomValidators.maxTwoDecimalPlaces()
    ]),

    "fatmass": new FormControl("", [
      Validators.pattern(ValidationPatterns.fatmass),
      Validators.required,
      Validators.min(2),
      Validators.max(100),
      CustomValidators.maxTwoDecimalPlaces()
    ]),

    "musclemass": new FormControl("", [
      Validators.pattern(ValidationPatterns.musclemass),
      Validators.required,
      CustomValidators.maxTwoDecimalPlaces()
    ]),
  })

  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;
  router: any;
  location: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    window.scrollTo(0, 0); // Scroll to the top of the page

    this.metricsId = this.route.snapshot.paramMap.get('metricsId')!;
    if (this.metricsId) {
      this.fetchMetricsForUser(this.metricsId);
    }
}

fetchMetricsForUser(metricsId: string): void {
    this.metricsService.fetchMetricsWithMetricsId(metricsId).subscribe({
      next: (fetchedMetric) => {
        if (fetchedMetric) {
          this.dateCreated = new Date(fetchedMetric.dateCreated);
          this.dateCreatedString = this.dateCreated.toLocaleDateString();
          const userId = fetchedMetric.userId; // Assuming each metric has a userId field
          
          this.clientManagementService.getClientDetails(userId).subscribe({
            next: (fetchedClientDetails: ClientProfile) => {
              this.clientName = fetchedClientDetails.fullName;
            },
            error: (error: any) => {
              this.errorMessage = "Error fetching client details. Please try again later.";
              console.error("Error fetching client details:", error);
            }
          });
          this.populateForm(fetchedMetric);
        }
        this.metrics = [fetchedMetric];
        this.filteredMetrics = this.transformedMetrics;
      },
      error: (error: any) => {
        this.errorMessage = "Error fetching metrics. Please try again later.";
        console.error("Error fetching metrics:", error);
      }
    });
}

  populateForm(metric: Metrics): void {
    this.addclientMetricsForm.patchValue({
      bodyweight: metric.bodyweight.toString(),
      fatmass: metric.fatMass.toString(),
      musclemass: metric.muscleMass.toString()
    });
  }
  
  submitEditedMetrics(): void {
    
    const EditedMetricsToSubmit: MetricsToEdit = { // Assigning the values of the controls to the object to be sent to the service
      Bodyweight: Number.parseFloat(this.addclientMetricsForm.controls['bodyweight'].value!), // The ! (non-null assertion operator) in TypeScript is used to tell the compiler: "I am sure this value will never be null or undefined, so don’t show any errors."
      FatMass:  Number.parseFloat(this.addclientMetricsForm.controls['fatmass'].value!),
      MuscleMass: Number.parseFloat(this.addclientMetricsForm.controls['musclemass'].value!),
      metricsId: this.metricsId!
    }

    // Call service to add the metrics
    this.metricsService.editMetrics(EditedMetricsToSubmit).subscribe({
      next: (metrics: Metrics) => {
        console.log("Metrics Edited.");
        this.metricsId = metrics.id;
      },
      error: (error:any) => {
        //this.errorMessage = "Error adding metrics. Please try again later.";
        console.error("Error adding metrics."); // Log error to the console
      }
    })

  }

  bodyWeightErrorMessages = new Map<string, string>([
    ["required", "Bodyweight is required"],
    ["pattern", "Invalid bodyweight format"],
    ["maxTwoDecimalPlaces", "Bodyweight can have a maximum of two decimal places"]
  ]);

  fatMassErrorMessages = new Map<string, string>([
    ["required", "Fat mass is required"],
    ["pattern", "Invalid fat mass format"],
    ["min", "Fat mass cannot be less than 0"],
    ["max", "Fat mass cannot be more than 100"],
    ["maxTwoDecimalPlaces", "Fat mass can have a maximum of two decimal places"]
  ]);

  muscleMassErrorMessages = new Map<string, string>([
    ["required", "Muscle mass is required"],
    ["pattern", "Invalid muscle mass format"],
    ["maxTwoDecimalPlaces", "Muscle mass can have a maximum of two decimal places"]
  ]);
}