import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientManagementService } from '../../../services/client-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

/**
 * Component for managing a single client.
 * Allows navigation to various client-related pages (details, diets, history, etc.).
 */
@Component({
  selector: 'app-manage-client',
  standalone: true,
  imports: [ReactiveFormsModule, NavBarComponent],
  templateUrl: './manage-client.component.html',
  styleUrl: './manage-client.component.css'
})
export class ManageClientComponent implements OnInit {
 
  // User ID (not used in this component, but available if needed)
  userId: string | null = null;

  // Injected client management service for API calls
  clientManagementService = inject(ClientManagementService);

  // Current client ID from route
  clientId: string | null = null;
  // Loaded client details
  client: ClientProfile | null = null;

  // Controls for error display in input fields (not used here, but available)
  displayErrorOnControlTouched = true;
  displayErrorOnControlDirty = true;

  constructor(private route: ActivatedRoute, private router: Router) { }

  /**
   * On component initialization, get client ID from route and load client details.
   */
  ngOnInit(): void{
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    window.scrollTo(0, 0);

    if (!this.clientId) return;
    const client$ = this.clientManagementService.getClientDetails(this.clientId);
    client$.subscribe(client => {
      this.client = client;
    });
  }

  /**
   * Navigate to a route, replacing :clientId with the actual client ID.
   * Used for all navigation buttons in the template.
   */
  navigateTo(route: string) {
    if (this.clientId) {
      const updatedRoute = route.replace(':clientId', this.clientId);
      this.router.navigate([updatedRoute]);
    }
  }

}