import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientManagementService } from '../../../services/client-management.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-delete-client',
  standalone: true,
  templateUrl: './delete-client.component.html',
  imports: [CommonModule, NavBarComponent],
  styleUrls: ['./delete-client.component.css']
})
export class DeleteClientComponent implements OnInit {
  clientId: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientManagementService: ClientManagementService
  ) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
  }

  deleteClient(): void {
    if (!this.clientId) return;

    console.log('Deleting client:', this.clientId);

    this.clientManagementService.deleteClient(this.clientId).subscribe({
      next: () => {
        this.successMessage = 'Client deleted successfully';
        this.errorMessage = null;
        // Optionally, navigate to another page after deletion
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.errorMessage = 'Error deleting client';
        this.successMessage = null;
      }
    });
  }
}