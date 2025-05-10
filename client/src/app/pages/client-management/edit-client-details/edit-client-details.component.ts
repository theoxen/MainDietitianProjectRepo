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
import { ToastrService } from 'ngx-toastr';

/**
 * Component for editing a client's details.
 * Handles form population, validation, and update logic.
 */
@Component({
  selector: 'app-edit-client-details',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PrimaryInputFieldComponent, PrimaryDropdownInputComponent],
  templateUrl: './edit-client-details.component.html',
  styleUrls: ['./edit-client-details.component.css']
})
export class EditClientDetailsComponent {
  // Injected services for API calls and dropdowns
  clientManagementService = inject(ClientManagementService);
  dietTypeService = inject(DietTypesService);
  
  // Dropdown options for diet types
  dietTypeDropdownOptions: DropdownItem<string, string>[] = [];
  // Current client ID from route
  clientId: string | null = null;
  // Loaded client details
  client: ClientProfile | null = null;

  // Controls for error display in input fields
  displayErrorOnControlTouched = true;
  displayErrorOnControlDirty = true;

  // Reactive form for editing client details
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

  // Error messages for each field
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

  // Flags for duplicate email/phone errors
  emailExists: boolean | undefined;
  phoneNumberExists: boolean | undefined;

  constructor(private route: ActivatedRoute, private router: Router, private toastr: ToastrService) { }

  /**
   * On component initialization, load client details and diet types.
   * Populate the form with existing client data.
   */
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    
    if (!this.clientId) return;

    // Load both client details and diet types together
    const client$ = this.clientManagementService.getClientDetails(this.clientId);
    const diets$ = this.dietTypeService.loadDietTypes();

    combineLatest([client$, diets$]).subscribe({
      next: ([client, dietTypes]) => {
        this.client = client;

        // Populate the diet dropdown options
        this.dietTypeDropdownOptions = dietTypes.map(dietType => ({
          value: dietType.id,
          displayedValue: dietType.name
        }));

        // Set form values from loaded client
        this.clientUpdateForm.controls.FullName.setValue(client.fullName);
        this.clientUpdateForm.controls.PhoneNumber.setValue(client.phoneNumber);
        this.clientUpdateForm.controls.Email.setValue(client.email);
        this.clientUpdateForm.controls.Height.setValue(client.height);

        // Find and set matching diet type in dropdown
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

  /**
   * Submit the form to update client details.
   * Handles validation, duplicate errors, and navigation.
   */
  updateClient() {
    if (!this.clientId) return;
    if(this.clientUpdateForm.valid) {

      // Only update if the form has been modified
      if (!this.clientUpdateForm.dirty) {
        return;
      }
        
      // Prepare the update object from form values
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
          // Show success message and navigate to client details page
          this.toastr.success('Client updated successfully', 'Success');
          this.router.navigate([`/clients/${this.clientId}`]);
        },
        error: (error) => {
          // Handle duplicate email/phone errors
          console.error('Error updating client:', error);
          this.emailExists = false;
          this.phoneNumberExists = false;   
          for (const httpError of error.errors) {
            if (httpError.message == "Email already exists" ) {
                this.emailExists = true;
                this.toastr.error('Email already exists', 'Error');
              }
            if (httpError.message == "Phone number already exists") {
                this.phoneNumberExists = true;
                this.toastr.error('Phone number already exists', 'Error');
            }
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.clientUpdateForm.markAllAsTouched();
    }
  }

  /**
   * Cancel editing and navigate back to the previous page.
   */
  cancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}