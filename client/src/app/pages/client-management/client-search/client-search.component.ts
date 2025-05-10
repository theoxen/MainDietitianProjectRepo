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

/**
 * Component for searching clients by phone, name, and diet type.
 * Displays a filtered and sorted list of clients.
 */
@Component({
  selector: 'app-client-search',
  standalone: true,
  imports: [NavBarComponent, PrimaryInputFieldComponent, ReactiveFormsModule, ErrorComponent, RouterLink, CommonModule, FormsModule, PrimaryDropdownInputComponent],
  templateUrl: './client-search.component.html',
  styleUrl: './client-search.component.css'
})
export class ClientSearchComponent implements OnInit {
  
  // Controls for error display in input fields
  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;
  phoneNumberExists = true;

  // All clients fetched from the API
  clients: ClientProfile[] = [];
  // Clients after filtering and sorting
  filteredClients: ClientProfile[] = [];

  // Form controls for searching/filtering
  searchNameControl = new FormControl('');
  searchDietTypeControl = new FormControl(''); 

  // Dropdown options for diet types
  dietTypeDropdownOptions: DropdownItem<string, string>[] = []; 

  // Injected services
  dietTypeService = inject(DietTypesService);
  clientManagementService = inject(ClientManagementService);

  // Used for navigation to client details
  clientId: any|string;

  constructor(private router: Router) { }

  /**
   * On component initialization, fetch clients and diet types.
   * Set up subscriptions for search/filter controls.
   */
  ngOnInit(): void {
    window.scrollTo(0, 0);
    
    this.fetchClients();
    this.loadDietTypes();
    
    // Update filtered clients when name filter changes
    this.searchNameControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filteredClients = this.filterClients();
    });

    // Update filtered clients when diet type filter changes
    this.searchDietTypeControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filteredClients = this.filterClients();
    });
  }

  /**
   * Load available diet types for the dropdown filter.
   */
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

  /**
   * Fetch all clients from the API, remove admin, and sort A → Z.
   * Also fetches client IDs by phone number for navigation.
   */
  fetchClients(): void {
    this.clientManagementService.getAllClients().subscribe({
        next: (clients) => {
            // Remove admin and sort A → Z only on first load
            this.clients = clients
                .filter(client => client.fullName.toLowerCase() !== "admin")
                .sort((a, b) => a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase()));

            // Fetch client IDs by phone number for each client
            this.clients.forEach(client => {
                this.clientManagementService.getClientIdByPhoneNumber(client.phoneNumber).subscribe({
                    next: (clientId) => {
                        client.id = clientId;
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

  // Current sort order for the client list
  sortOrder: string = 'asc';

  /**
   * Filter clients by name and diet type.
   * Prioritizes clients whose names start with the filter.
   */
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

  /**
   * Trigger sorting when the sort dropdown changes.
   */
  sortClients(): void {
    this.filteredClients = this.applySorting(this.filterClients());
  }

  /**
   * Sorts a list of clients alphabetically based on the selected order.
   */
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

  // Reactive form for searching by phone number
  searchClientForm = new FormGroup({
    "phoneNumber": new FormControl("", [
     // Validators.required,
      Validators.pattern(ValidationPatterns.phoneNumber)
    ])
  });

  // Error messages for phone number field
  phoneNumberErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["pattern", ValidationMessages.phoneNumber]
  ])

  /**
   * Returns error message if phone number does not exist.
   */
  get phoneNumberExistsMessage() {
    return !this.phoneNumberExists && !this.searchClientForm.controls.phoneNumber.dirty ? "*Phone number does not exist" : "";
  }

  /**
   * Handles searching for a client by phone number.
   * Navigates to client details if found, otherwise shows error.
   */
  searchClient() {
    if(this.searchClientForm.valid) {

      // Only search if the form has been modified
      if (!this.searchClientForm.dirty) {
        return;
      }

      // If phone number is entered, try to fetch client ID
      if (this.searchClientForm.controls.phoneNumber.value != null)
      {
        this.clientManagementService.getClientIdByPhoneNumber(this.searchClientForm.controls.phoneNumber.value).subscribe({

          next: (clientId) => {
            // Navigate to client details page if found
            this.router.navigate([`/clients/${clientId}`]);
            this.phoneNumberExists = true;
            this.searchClientForm.markAsPristine();
          },
          error: (error: any) => {
            // If not found, show error message
            if(error.statusCode == 404) {
              this.phoneNumberExists = false;
            }
            this.searchClientForm.markAsPristine();
          }
        });
      }

    } else {
      // Mark all fields as touched to show validation errors
      this.searchClientForm.markAllAsTouched();
    }
  }
}