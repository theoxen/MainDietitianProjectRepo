import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientManagementService } from '../../../services/client-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { NoteService } from '../../../services/note.service';
import { Note } from '../../../models/notes/note';
import { MetricsService } from '../../../services/metrics.service';
import { Metrics } from '../../../models/metrics/metrics';
import { CommonModule } from '@angular/common';
import { DietService } from '../../../services/diet.service';
import { PaginationComponent } from "../../pagination/pagination.component";


@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './client-history.component.html',
  styleUrl: './client-history.component.css'
})
export class ClientHistoryComponent implements OnInit {
  clientManagementService = inject(ClientManagementService);
  noteService = inject(NoteService);
  metricsService = inject(MetricsService);
  dietService = inject(DietService);

  clientId: string | null = null;
  client: ClientProfile | null = null;
  clientNote: Note | null = null;
  clientMetrics: Metrics[] | null = null;
  dietId: string | null = null; 
  
 
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.clientId = this.route.snapshot.paramMap.get('clientId');
    console.log("Captured Client ID in ClientHistoryComponent:", this.clientId);

    if (this.clientId) {
      // Fetch client details
      this.clientManagementService.getClientDetails(this.clientId).subscribe(client => {
        this.client = client;
      });

      // Fetch client note
      this.noteService.fetchNoteForUser(this.clientId).subscribe({
        next: (note) => {
          this.clientNote = note;
        },
        error: (error) => {
          console.error("Error fetching note:", error);
        }
      });

      // Fetch client metrics
      this.metricsService.fetchMetricsForUser(this.clientId).subscribe({
        next: (metrics) => {
          this.clientMetrics = metrics;
        },
        error: (error) => {
          console.error("Error fetching client metrics:", error);
        }
      });

      
    }
  }

  

 
  calculateClientAge(client: ClientProfile | null): number {
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
}