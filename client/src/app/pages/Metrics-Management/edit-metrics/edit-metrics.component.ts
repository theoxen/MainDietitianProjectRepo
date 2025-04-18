import { Component, Inject, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MetricsService } from '../../../services/metrics.service';
import { Metrics } from '../../../models/metrics/metrics';
import { ClientManagementService } from '../../../services/client-management.service';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { CustomValidators } from '../../../validation/CustomValidators';
import { MetricsToEdit } from '../../../models/metrics/metrics-to-edit';
import { ConfirmationWindowComponent } from "../../../components/confirmation-window/confirmation-window.component";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'edit-metrics',
  standalone: true,
  imports: [ ReactiveFormsModule, PrimaryInputFieldComponent, ConfirmationWindowComponent],
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
 private toastr = inject(ToastrService);
  metricsService = inject(MetricsService);
  clientManagementService = inject(ClientManagementService);

clientMetrics = new FormGroup({
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
  location: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { metricId: string },
  private dialogRef: MatDialogRef<EditMetricsComponent>,
  private router: Router) {}

  ngOnInit(): void {
    this.metricsId = this.data.metricId;
    window.scrollTo(0, 0); // Scroll to the top of the page
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
          this.userId = fetchedMetric.userId;
          this.clientManagementService.getClientDetails(userId).subscribe({
            next: (fetchedClientDetails: ClientProfile) => {
              this.clientName = fetchedClientDetails.fullName;
            },
            error: (error: any) => {
              //this.errorMessage = "Error fetching client details. Please try again later.";
              //console.error("Error fetching client details:", error);
            }
          });
          this.populateForm(fetchedMetric);
        }
        this.metrics = [fetchedMetric];
        this.filteredMetrics = this.transformedMetrics;
      },
      error: (error: any) => {
        //this.errorMessage = "Error fetching metrics. Please try again later.";
        //console.error("Error fetching metrics:", error);
      }
    });
}

  populateForm(metric: Metrics): void {
    this.clientMetrics.patchValue({
      bodyweight: metric.bodyweight.toString(),
      fatmass: metric.fatMass.toString(),
      musclemass: metric.muscleMass.toString()
    });
  }
  
  submitEditedMetrics(): void {
    if (!this.clientMetrics.dirty) {
      
      return;
    }
    const EditedMetricsToSubmit: MetricsToEdit = { // Assigning the values of the controls to the object to be sent to the service
      Bodyweight: Number.parseFloat(this.clientMetrics.controls['bodyweight'].value!), // The ! (non-null assertion operator) in TypeScript is used to tell the compiler: "I am sure this value will never be null or undefined, so don’t show any errors."
      FatMass:  Number.parseFloat(this.clientMetrics.controls['fatmass'].value!),
      MuscleMass: Number.parseFloat(this.clientMetrics.controls['musclemass'].value!),
      metricsId: this.metricsId!
    }

    // Call service to add the metrics
    this.metricsService.editMetrics(EditedMetricsToSubmit).subscribe({
      next: (metrics: Metrics) => {
        this.toastr.success("Metrics Edited Successfully!");
        this.metricsId = metrics.id;
        this.dialogRef.close(); // Close the modal after successful submission
      },
      error: (error:any) => {
        this.toastr.error("There was an Error while adding metrics. Please try again later.");
        //this.errorMessage = "Error adding metrics. Please try again later.";
        //console.error("Error adding metrics."); // Log error to the console
      }
    })

  }
  
  
  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }
  
  handleDeleteConfirmation(result: boolean) {
    this.isConfirmationWindowVisible = false;
    if (result) {
      // Call service to delete the metrics
      // IF WE WANTED TO MANUALLY SUBMIT THE FORM AFTER THE CONFIRMATION WINDOW WE WOULD DO this.onSubmit(); 
      this.metricsService.deleteMetrics(this.metricsId!).subscribe({
        next: () => {
          this.toastr.success("Metrics deleted successfully!");
          this.dialogRef.close(); // Close the modal after successful deletion
        }
      });
    } else {
      
    }
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