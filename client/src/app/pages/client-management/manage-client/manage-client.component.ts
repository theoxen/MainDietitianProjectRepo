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
  clientManagementService = inject(ClientManagementService);
  clientId: string | null = null;
  client: ClientProfile | null = null;
  clientmanagement: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
    this.clientmanagement = this.fb.group({
      fullName: [''],
      phoneNumber: [''],
      email: [''],
      height: [''],
      dietTypeName: [''],
      gender: [''],
      dateOfBirth: ['']
    });
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    if (this.clientId) {
      this.loadClient(this.clientId);
    }
  }

  loadClient(clientId: string): void {
    this.clientManagementService.getClientDetails(clientId).subscribe((data: ClientProfile) => {
      this.client = data;
      this.clientmanagement.patchValue(data);
    });
  }

  updateClient(client: ClientProfile): void {
    if (this.clientId) {
      this.clientManagementService.updateClient(this.clientId, client).subscribe(() => {
        this.loadClient(this.clientId!);
      });
    }
  }

  deleteClient(): void {
    if (this.clientId) {
      this.clientManagementService.deleteClient(this.clientId).subscribe(() => {
        this.router.navigate(['/clients']);
        alert('Client deleted successfully');
      });
    }
  }
}