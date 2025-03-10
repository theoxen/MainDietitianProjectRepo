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

@Component({
  selector: 'app-view-client-details',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PrimaryInputFieldComponent, PrimaryDropdownInputComponent],
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.css']
})
export class ViewClientDetailsComponent implements OnInit {
  clientManagementService = inject(ClientManagementService);
  dietTypeService = inject(DietTypesService);
  
  dietTypeDropdownOptions: DropdownItem<string, string>[] = [];
  clientId: string | null = null;
  client: ClientProfileAllView | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    
    if (!this.clientId) return;

    const client = this.clientManagementService.getAllClientDetails(this.clientId).subscribe({
      next: (client) => {;
        this.client = client;
    
        console.log('Client details:', client); // Debugging statement

        // Set form values
      }
    });

  }
}