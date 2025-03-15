import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientManagementService } from '../../../services/client-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-manage-client',
  standalone: true,
  imports: [ReactiveFormsModule, NavBarComponent],
  templateUrl: './manage-client.component.html',
  styleUrl: './manage-client.component.css'
})
export class ManageClientComponent implements OnInit {

  userId: string | null = null;

  clientManagementService = inject(ClientManagementService);

  clientId: string | null = null;
  client: ClientProfile | null = null;

  displayErrorOnControlTouched = true;
  displayErrorOnControlDirty = true;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void{
    this.clientId = this.route.snapshot.paramMap.get('clientId');

    //console.log("Captured Client ID in ManageClientComponent:", this.clientId); // Debugging

    if (!this.clientId) return;

    
    //console.log("Managing client with ID:", this.clientId);

    const client$ = this.clientManagementService.getClientDetails(this.clientId);
    client$.subscribe(client => {
      this.client = client;
    });
  }

  navigateTo(route: string) {
    if (this.clientId) {
      const updatedRoute = route.replace(':clientId', this.clientId);
      this.router.navigate([updatedRoute]);
    }
  }

}