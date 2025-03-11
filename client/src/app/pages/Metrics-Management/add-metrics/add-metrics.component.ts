import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl,Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetricsService } from '../../../services/metrics.service';
import { MetricsToAdd } from '../../../models/metrics/metrics-to-add';
import { Metrics } from '../../../models/metrics/metrics';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from '../../../components/primary-input-field/primary-input-field.component';
import { ValidationMessages } from '../../../validation/validation-messages';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { CustomValidators } from '../../../validation/CustomValidators';
import { ClientManagementService } from '../../../services/client-management.service';
import { ClientProfile } from '../../../models/client-management/client-profile';

@Component({
  selector: 'add-metrics', 
  standalone: true,
  imports: [ReactiveFormsModule, NavBarComponent, PrimaryInputFieldComponent],
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

  
  metricsService = inject(MetricsService);
  clientManagementService = inject(ClientManagementService);


  constructor(private route: ActivatedRoute, private fb: FormBuilder) {};  // Required to use route.snapshot.paramMap to get the user ID from the URL)
  

  ngOnInit(): void {
    // Get the user ID from the URL
    this.clientId = this.route.snapshot.paramMap.get('clientId')!; // Gets the user ID from the URL (In the app.routes.ts file, the path is defined as "clients/:clientId/note")
    
    this.clientManagementService.getClientDetails(this.clientId).subscribe({
              next: (fetchedClientDetails:ClientProfile) =>{
                this.clientName = fetchedClientDetails.fullName;
              }
            })

    // if (this.clientId) {
    //   this.fetchMetricsForUser(this.clientId);
    // }

   
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

  // fetchMetricsForUser(clientId: string): void {

  //   // this.clientNote.controls.note.setValue("test"); // Set the note for the user

  //   this.metricsService.fetchMetricsForUser(clientId).subscribe({
  //     next: (fetchedMetrics) => {
  //       this.metricsid = fetchedMetrics.id; // Set the metrics ID
  //       this.addclientMetricsForm.controls.bodyweight.setValue(fetchedMetrics.Bodyweight); // Set the BodyWeight
  //       this.addclientMetricsForm.controls.fatmass.setValue(fetchedMetrics.FatMass); // Set the FatMass
  //       this.addclientMetricsForm.controls['musclemass'].setValue(fetchedMetrics.MuscleMass); // Set the MuscleMass
  //     },
  //     error: (error: any) => {
  //       this.errorMessage = "Error fetching metrics. Please try again later.";
  //       console.error("Error fetching metrics:", error); // Log detailed error to the console
  //     }
  //   });

  // }

  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }

  addMetrics() {
    
    const MetricsToAdd: MetricsToAdd = { // Assigning the values of the controls to the object to be sent to the service
      Bodyweight: Number.parseFloat(this.addclientMetricsForm.controls['bodyweight'].value!), // The ! (non-null assertion operator) in TypeScript is used to tell the compiler: "I am sure this value will never be null or undefined, so don’t show any errors."
      FatMass:  Number.parseFloat(this.addclientMetricsForm.controls['fatmass'].value!),
      MuscleMass: Number.parseFloat(this.addclientMetricsForm.controls['musclemass'].value!),
      userId: this.clientId!
    }

    // Call service to add the metrics
    this.metricsService.addMetrics(MetricsToAdd).subscribe({
      next: (metrics: Metrics) => {
        console.log("Metrics added.");
        this.metricsid = metrics.id;
        this.addclientMetricsForm.reset();  // Clear the form after adding metrics
      },
      error: (error:any) => {
        //this.errorMessage = "Error adding metrics. Please try again later.";
        console.error("Error adding metrics."); // Log error to the console
      }
    })

  }

  // editMetrics() {
  //   const MetricsToEdit: MetricsToEdit = { // Assigning the values of the controls to the object to be sent to the service
  //     Bodyweight: this.addclientMetricsForm.controls['bodyweight'].value!, 
  //     FatMass: this.addclientMetricsForm.controls['fatmass'].value!,
  //     MuscleMass: this.addclientMetricsForm.controls['musclemass'].value!,
  //     id: this.metricsid!
  //   }
  //   // Call service to update the note
  //   this.metricsService.editMetrics(MetricsToEdit).subscribe({
  //     next: () => {
  //       console.log("Metrics updated.");
  //     },
  //     error: (error: any) => {
  //       this.errorMessage = "Error updating metrics. Please try again later.";
  //       console.error("Error updating metrics:", error); // Log detailed error to the console
  //     }
  //   })
  // }

  // handleDeleteConfirmation(result: boolean) {
  //   this.isConfirmationWindowVisible = false;
  //   if (result) {
  //     // Call service to delete the metrics
  //     // IF WE WANTED TO MANUALLY SUBMIT THE FORM AFTER THE CONFIRMATION WINDOW WE WOULD DO this.onSubmit(); 
  //     this.metricsService.deleteMetrics(this.metricsid).subscribe({
  //       next: () => {
  //         console.log("Metrics deleted.");
  //         this.addclientMetricsForm.controls['bodyweight'].setValue(null);
  //       },
  //       error: (error: any) => {
  //         this.errorMessage = "Error deleting metrics. Please try again later.";
  //         console.error("Error deleting metrics:", error); // Log detailed error to the console
  //       }
  //     });
  //   } else {
  //     console.log('Cancelled.');
  //   }
  // }

  // searchMetrics(): void {
  //   const userId = this.addclientMetricsForm.get('userId')?.value;
  //   const date = this.addclientMetricsForm.get('date')?.value ? new Date(this.addclientMetricsForm.get('date')?.value) : undefined;

  //   this.metricsService.searchMetrics(userId, date).subscribe({
  //     next: (metrics) => {
  //       this.metrics = metrics;
  //     },
  //     error: (error) => {
  //       console.error('Error searching metrics:', error);
  //     }
  //   });
  // }


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
