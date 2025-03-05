import { Component, inject } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { ValidationMessages } from '../../../validation/validation-messages';
import { ClientManagementService } from '../../../services/client-management.service';
import { HttpResponseError } from '../../../models/http-error';
import { ErrorComponent } from "../../../components/error/error.component";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-search',
  standalone: true,
  imports: [NavBarComponent, PrimaryInputFieldComponent, ReactiveFormsModule, ErrorComponent, RouterLink],
  templateUrl: './client-search.component.html',
  styleUrl: './client-search.component.css'
})
export class ClientSearchComponent {
  
  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;
  phoneNumberExists = true;

  clientManagementService = inject(ClientManagementService);

  constructor(private router: Router) { }
  
  searchClientForm = new FormGroup({
    "phoneNumber": new FormControl("", [
      Validators.required,
      Validators.pattern(ValidationPatterns.phoneNumber)
    ])
  });

  phoneNumberErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.phoneNumber]
  ])

  get phoneNumberExistsMessage() {
    return !this.phoneNumberExists && !this.searchClientForm.controls.phoneNumber.dirty ? "*Phone number does not exist" : "";
  }

  searchClient() {
    if(this.searchClientForm.valid) {

      if (!this.searchClientForm.dirty) {
        return;
      }

      if (this.searchClientForm.controls.phoneNumber.value != null)
      {
        this.clientManagementService.getClientIdByPhoneNumber(this.searchClientForm.controls.phoneNumber.value).subscribe({
          next: (clientId) => {
            this.router.navigate([`/clients/${clientId}`]);
            this.phoneNumberExists = true;
            this.searchClientForm.markAsPristine();
          },
          error: (error: any) => {
            if(error.statusCode == 404) {
              this.phoneNumberExists = false;
            }
            this.searchClientForm.markAsPristine();
          }
        });
      }

    } else {
      this.searchClientForm.markAllAsTouched();
    }
  }
}
