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
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DietTypesService } from '../../../services/diet-types.service';
import { DropdownItem } from '../../../components/primary-dropdown-input/dropdown-item';
import { PrimaryDropdownInputComponent } from "../../../components/primary-dropdown-input/primary-dropdown-input.component";

@Component({
  selector: 'app-client-search',
  standalone: true,
  imports: [NavBarComponent, PrimaryInputFieldComponent, ReactiveFormsModule, ErrorComponent, RouterLink, CommonModule, FormsModule, PrimaryDropdownInputComponent],
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
  dietTypeDropdownOptions: DropdownItem<string, string>[] = []; 
  dietTypeService = inject(DietTypesService);
  clientManagementService = inject(ClientManagementService);
  clientId: any|string;

  

  constructor(private router: Router) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    
    this.fetchClients();
    this.loadDietTypes();
    //console.log("Client ID ngonit: ", this.clientId); //debugging
    
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

  loadDietTypes(): void {
    this.dietTypeService.loadDietTypes().subscribe({
      next: (dietTypes) => {
        this.dietTypeDropdownOptions = [
          { value: '', displayedValue: 'ALL' }, // Add the "ALL" option
          ...dietTypes.map(dietType => ({
            value: dietType.name, // Filter by name instead of ID
            displayedValue: dietType.name
          }))
        ];
      },
      error: (error) => {
        console.error("Error loading diet types:", error);
      }
    });
}

  fetchClients(): void {
    this.clientManagementService.getAllClients().subscribe({
        next: (clients) => {
            //console.log("Client ID fetched: ", this.clientId); //debugging

            // Remove admin and sort A → Z only on first load
            this.clients = clients
                .filter(client => client.fullName.toLowerCase() !== "admin")
                .sort((a, b) => a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase()));

            // Fetch client IDs by phone number
            this.clients.forEach(client => {
                this.clientManagementService.getClientIdByPhoneNumber(client.phoneNumber).subscribe({
                    next: (clientId) => {
                        client.id = clientId;
                        //console.log(`Client ID for ${client.phoneNumber}: ${clientId}`); // Debugging
                    },
                    error: (error: any) => {
                        console.error(`Error fetching client ID for ${client.phoneNumber}:`, error);
                    }
                });
            });

            this.filteredClients = [...this.clients]; // Ensure initially sorted list

            
        },
        error: (error: any) => {
            console.error("Error fetching clients:", error);
        }
    });
}

sortOrder: string = 'asc';

  filterClients(): ClientProfile[] {
    const nameFilter = this.searchNameControl.value?.toLowerCase().trim() || '';
    const dietTypeFilter = this.searchDietTypeControl.value?.toLowerCase().trim() || '';

    let filtered = this.clients
        .filter(client =>
            client.fullName.toLowerCase().includes(nameFilter) &&
            client.dietTypeName.toLowerCase().includes(dietTypeFilter)
        );

    // Prioritize clients whose names START with the filter
    filtered.sort((a, b) => {
        const aStartsWith = a.fullName.toLowerCase().startsWith(nameFilter) ? -1 : 1;
        const bStartsWith = b.fullName.toLowerCase().startsWith(nameFilter) ? -1 : 1;

        // If both start with the filter or neither does, apply sorting
        if (aStartsWith === bStartsWith) {
            return this.applySorting([a, b])[0] === a ? -1 : 1;
        }
        return aStartsWith - bStartsWith;
    });

    return filtered;
  }
  // Method to trigger sorting when dropdown changes
  sortClients(): void {
    this.filteredClients = this.applySorting(this.filterClients());
  }

  applySorting(list: ClientProfile[]): ClientProfile[] {
    return list.sort((a, b) => {
        const nameA = a.fullName.toLowerCase();
        const nameB = b.fullName.toLowerCase();

        if (this.sortOrder === 'asc') {
            return nameA.localeCompare(nameB); // A → Z
        } else if (this.sortOrder === 'desc') {
            return nameB.localeCompare(nameA); // Z → A
        }
        return 0; // Default, no sorting change
    });
  }

  searchClientForm = new FormGroup({
    "phoneNumber": new FormControl("", [
     // Validators.required,
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