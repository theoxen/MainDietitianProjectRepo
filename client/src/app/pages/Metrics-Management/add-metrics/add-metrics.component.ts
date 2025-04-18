import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormControl,Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetricsService } from '../../../services/metrics.service';
import { MetricsToAdd } from '../../../models/metrics/metrics-to-add';
import { Metrics } from '../../../models/metrics/metrics';
import { PrimaryInputFieldComponent } from '../../../components/primary-input-field/primary-input-field.component';
import { ValidationMessages } from '../../../validation/validation-messages';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { CustomValidators } from '../../../validation/CustomValidators';
import { ClientManagementService } from '../../../services/client-management.service';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'add-metrics', 
  standalone: true,
  imports: [ReactiveFormsModule, PrimaryInputFieldComponent],
  templateUrl: './add-metrics.component.html',
  styleUrl: './add-metrics.component.css'
})

export class AddMetricsComponent implements OnInit {

  isConfirmationWindowVisible = false;
  clientId?: string;
  metricsid: string = "";
  errorMessage: string = "";
  metrics!: Metrics[];
  clientName!: string;

  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  private toastr = inject(ToastrService);
  metricsService = inject(MetricsService);
  clientManagementService = inject(ClientManagementService);


  constructor(@Inject(MAT_DIALOG_DATA) public data: { clientId: string },
    private dialogRef: MatDialogRef<AddMetricsComponent>) {}

  ngOnInit(): void {
    // Get the user ID from the data 
    this.clientId = this.data.clientId;
    
    this.clientManagementService.getClientDetails(this.clientId).subscribe({
              next: (fetchedClientDetails:ClientProfile) =>{
                this.clientName = fetchedClientDetails.fullName;
              },
              error: (err) => {
                //console.error('Error fetching client details:', err);
                this.clientName = 'Unknown Client'; // Fallback value in case of an error
              }
            })

  

   
  }

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


  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }

  addMetrics() {
    if (this.addclientMetricsForm.invalid) {
      this.addclientMetricsForm.markAllAsTouched();
      return;
    }
    const MetricsToAdd: MetricsToAdd = { // Assigning the values of the controls to the object to be sent to the service
      Bodyweight: Number.parseFloat(this.addclientMetricsForm.controls['bodyweight'].value!), // The ! (non-null assertion operator) in TypeScript is used to tell the compiler: "I am sure this value will never be null or undefined, so don’t show any errors."
      FatMass:  Number.parseFloat(this.addclientMetricsForm.controls['fatmass'].value!),
      MuscleMass: Number.parseFloat(this.addclientMetricsForm.controls['musclemass'].value!),
      userId: this.clientId!
    }

    // Call service to add the metrics
    this.metricsService.addMetrics(MetricsToAdd).subscribe({
      next: (metrics: Metrics) => {
        this.toastr.success("Metrics Added!");
        this.metricsid = metrics.id;
        // this.addclientMetricsForm.reset();  // Clear the form after adding metrics
        this.dialogRef.close(); // Close the modal after successful addition

        
      },
      error: (error:any) => {
        this.toastr.error("There was an error while adding metrics. Please try again.");
        //this.errorMessage = "Error adding metrics. Please try again later.";
        //console.error("Error adding metrics."); // Log error to the console
      }
    })

  }


    bodyWeightErrorMessages = new Map<string, string>([
      ["required", ValidationMessages.required],
      ["pattern", ValidationMessages.bodyweight],
      ["maxTwoDecimalPlaces", ValidationMessages.maxTwoDecimalPlacesBodyWeight]
    ])

    fatMassErrorMessages = new Map<string, string>([
      ["required", ValidationMessages.required],
      ["pattern",ValidationMessages.fatmass],
      ["min",ValidationMessages.fatMassMinValue],
      ["max",ValidationMessages.fatMassMaxValue],
      ["maxTwoDecimalPlaces", ValidationMessages.maxTwoDecimalPlacesFatMass]
    ])

    muscleMassErrorMessages = new Map<string, string>([
      ["required", ValidationMessages.required],
      ["pattern",ValidationMessages.musclemass],
      ["maxTwoDecimalPlaces", ValidationMessages.maxTwoDecimalPlacesMuscleMass]
    ])
}
