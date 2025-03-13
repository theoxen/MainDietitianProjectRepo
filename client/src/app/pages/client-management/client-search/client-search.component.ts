import { Component, inject, OnInit } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { ValidationMessages } from '../../../validation/validation-messages';
import { ClientManagementService } from '../../../services/client-management.service';
import { HttpResponseError } from '../../../models/http-error';
import { ErrorComponent } from "../../../components/error/error.component";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { CommonModule } from '@angular/common'; // Add this import



@Component({
  selector: 'app-client-search',
  standalone: true,
  imports: [NavBarComponent, PrimaryInputFieldComponent, ReactiveFormsModule, ErrorComponent, RouterLink, CommonModule],
  templateUrl: './client-search.component.html',
  styleUrl: './client-search.component.css'
})
export class ClientSearchComponent implements OnInit {
  
  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;
  phoneNumberExists = true;
  clients: ClientProfile[] = [];
  filteredClients: ClientProfile[] = [];
  searchNameControl = new FormControl('');
  searchDietTypeControl = new FormControl('');

  clientManagementService = inject(ClientManagementService);
clientId: any|string;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.fetchClients();

    this.searchNameControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filteredClients = this.filterClients();
    });

    this.searchDietTypeControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filteredClients = this.filterClients();
    });
  }

  fetchClients(): void {
    this.clientManagementService.getAllClients().subscribe({
      next: (clients) => {
        console.log('Fetched clients:', clients); // Add this line
        this.clients = clients;
        this.filteredClients = clients;
      },
      error: (error: any) => {
        console.error("Error fetching clients:", error);
      }
    });
  }

  filterClients(): ClientProfile[] {
    const nameFilter = this.searchNameControl.value?.toLowerCase() || '';
    const dietTypeFilter = this.searchDietTypeControl.value?.toLowerCase() || '';

    return this.clients.filter(client =>
      client.fullName.toLowerCase().includes(nameFilter) &&
      client.dietTypeName.toLowerCase().includes(dietTypeFilter)
    );
  }

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