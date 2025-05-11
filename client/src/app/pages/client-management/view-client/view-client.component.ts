import { Component, OnInit, inject } from '@angular/core';
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
import { ClientProfileAllView } from '../../../models/client-management/client-view-profile';
import { Location } from '@angular/common';

/**
 * Component for viewing a client's details.
 * Displays all client information and allows navigation to edit or back.
 */
@Component({
  selector: 'app-view-client-details',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PrimaryInputFieldComponent, PrimaryDropdownInputComponent],
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.css']
})
export class ViewClientDetailsComponent implements OnInit {
  // Injected services for API calls and dropdowns
  clientManagementService = inject(ClientManagementService);
  dietTypeService = inject(DietTypesService);

  // Dropdown options for diet types (not used here, but available)
  dietTypeDropdownOptions: DropdownItem<string, string>[] = [];
  // Current client ID from route
  clientId: string | null = null;
  // Loaded client details
  client: ClientProfileAllView | null = null;
  // (Unused) property for client age
  clientAge: ClientProfileAllView | undefined;

  constructor(private route: ActivatedRoute, private router: Router, private location: Location) { }

  /**
   * On component initialization, get client ID from route and load client details.
   */
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    
    if (!this.clientId) return;

    // Fetch all details for the client by ID
    this.clientManagementService.getAllClientDetails(this.clientId).subscribe({
      next: (client) => {
        this.client = client;
        //console.log('Client details:', client); // Debugging statement
      }
    });
  }

  /**
   * Calculate the client's age based on date of birth.
   * Returns 0 if no client or date of birth is provided.
   */
  calculateClientAge(client: ClientProfileAllView | null): number {
    if (!client || !client.dateOfBirth) {
      return 0; // Handle missing data
    }
    
    const dob = new Date(client.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Navigate back to the previous page.
   */
  goBack(): void {
    this.location.back();
  }
  
  /**
   * Navigate to a route, replacing :clientId with the actual client ID.
   * Used for navigation buttons in the template.
   */
  navigateTo(route: string) {
    if (this.clientId) {
      const updatedRoute = route.replace(':clientId', this.clientId);
      this.router.navigate([updatedRoute]);
    }
  }
}