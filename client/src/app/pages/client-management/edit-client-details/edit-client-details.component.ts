import { Component, inject } from '@angular/core';
import { ClientManagementService } from '../../../services/client-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { ValidationMessages } from '../../../validation/validation-messages';
import { DietTypesService } from '../../../services/diet-types.service';
import { DropdownItem } from '../../../components/primary-dropdown-input/dropdown-item';
import { PrimaryDropdownInputComponent } from "../../../components/primary-dropdown-input/primary-dropdown-input.component";
import { combineLatest } from 'rxjs';
import { ClientProfileUpdate } from '../../../models/client-management/client-update';

@Component({
  selector: 'app-edit-client-details',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PrimaryInputFieldComponent, PrimaryDropdownInputComponent],
  templateUrl: './edit-client-details.component.html',
  styleUrls: ['./edit-client-details.component.css']
})
export class EditClientDetailsComponent {
  clientManagementService = inject(ClientManagementService);
  dietTypeService = inject(DietTypesService);
  
  dietTypeDropdownOptions: DropdownItem<string, string>[] = [];
  clientId: string | null = null;
  client: ClientProfile | null = null;

  displayErrorOnControlTouched = true;
  displayErrorOnControlDirty = true;

  

  clientUpdateForm = new FormGroup({
    "FullName": new FormControl('', [
      Validators.pattern(ValidationPatterns.fullName),
      Validators.required
    ]),
    "PhoneNumber": new FormControl('', [
      Validators.pattern(ValidationPatterns.phoneNumber),
      Validators.required
    ]),
    "Email": new FormControl('', [
      Validators.pattern(ValidationPatterns.email),
      Validators.required
    ]),
    "Height": new FormControl<number | null>(null, [
      Validators.pattern(ValidationPatterns.height),
      Validators.required
    ]),
    "DietTypeName": new FormControl('', [
      Validators.required
    ]),
  });

  fullNameErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.fullName]
  ]);

  phoneNumberErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.phoneNumber]
  ]);

  emailErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.email]
  ]);

  heightErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.height]
  ]);

  dietTypeErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required]
  ]);

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    
    if (!this.clientId) return;

    // Load both client details and diet types together
    const client$ = this.clientManagementService.getClientDetails(this.clientId);
    const diets$ = this.dietTypeService.loadDietTypes();

    combineLatest([client$, diets$]).subscribe({
      next: ([client, dietTypes]) => {
        this.client = client;
        //console.log('Client details:', client); // Debugging statement
        //console.log('Diet types:', dietTypes); // Debugging statement

        // Populate the diet dropdown options
        this.dietTypeDropdownOptions = dietTypes.map(dietType => ({
          value: dietType.id,
          displayedValue: dietType.name
        }));
        //console.log('Diet dropdown options:', this.dietTypeDropdownOptions); // Debugging statement

        // Set form values
        this.clientUpdateForm.controls.FullName.setValue(client.fullName);
        this.clientUpdateForm.controls.PhoneNumber.setValue(client.phoneNumber);
        this.clientUpdateForm.controls.Email.setValue(client.email);
        this.clientUpdateForm.controls.Height.setValue(client.height);

        // Find and set matching diet type
        const matchingDiet = this.dietTypeDropdownOptions.find(
          diet => diet.displayedValue === client.dietTypeName
        );

        if (matchingDiet) {
          this.clientUpdateForm.controls.DietTypeName.setValue(matchingDiet.value);
        }
      },
      error: (error) => {
        console.error('Error loading client details or diet types:', error);
      }

    });
    
  }
  updateClient() {
    if (!this.clientId) return;
    if(this.clientUpdateForm.valid) {

      if (!this.clientUpdateForm.dirty) {
        return;
      }
        
      const clientProfileUpdate: ClientProfileUpdate = {
        userId: this.clientId!,
        fullName: this.clientUpdateForm.controls.FullName.value!,
        phoneNumber: this.clientUpdateForm.controls.PhoneNumber.value!,
        email: this.clientUpdateForm.controls.Email.value!,
        height: this.clientUpdateForm.controls.Height.value!,
        dietTypeId: this.clientUpdateForm.controls.DietTypeName.value!
      };
    
      this.clientManagementService.updateClient(clientProfileUpdate).subscribe({
        next: (response) => {
          console.log('Client updated successfully:', response);
        },
        error: (error) => {
          console.error('Error updating client:', error);
        }
      });
    } else {
      this.clientUpdateForm.markAllAsTouched();
    }
    
  }
  cancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
