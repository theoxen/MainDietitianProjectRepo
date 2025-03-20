import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClientManagementService } from '../../../services/client-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientProfile } from '../../../models/client-management/client-profile';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";


@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [],
  templateUrl: './client-history.component.html',
  styleUrl: './client-history.component.css'
})
export class ClientHistoryComponent implements OnInit {
  
  clientManagementService = inject(ClientManagementService);
  clientId: string | null = null;
  client: ClientProfile | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void{
    window.scrollTo(0, 0);

    this.clientId = this.route.snapshot.paramMap.get('clientId');

    console.log("Captured Client ID in ClientHistoryComponent:", this.clientId);

    if (this.clientId) {
      const client$ = this.clientManagementService.getClientDetails(this.clientId);
      client$.subscribe(client => {
        this.client = client;
      });
    }
  }

  // navigateTo(route: string) {
  //   if (this.clientId) {
  //     const updatedRoute = route.replace(':clientId', this.clientId);
  //     this.router.navigate([updatedRoute]);
  //   }
  // }

}


@Component({
  selector: 'app-note-management',
  template: '<p>Note Management works!</p>',
})
export class NoteManagementComponent implements OnInit {
  clientId: any;
  route: any;
  noteService: any;
  noteId: any;
  clientNote: any;
  clientNoteIsNull: boolean | undefined;
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.clientId = this.route.snapshot.paramMap.get('clientId')!; // Gets the user ID from the URL (In the app.routes.ts file, the path is defined as "clients/:clientId/note")
    this.fetchNoteForUser(this.clientId);
    console.log("Captured Client ID in NotesforHistory:", this.clientNote.controls.note.value); // Log the note for the user
  }
  fetchNoteForUser(clientId: string): void {

    // this.clientNote.controls.note.setValue("test"); // Set the note for the user

    // Implement your logic to fetch notes for the user
    this.noteService.fetchNoteForUser(clientId).subscribe({
      next: (fetchedNote: { id: any; noteText: any; }) => {
        this.noteId = fetchedNote.id; // Set the note ID
        this.clientNote.controls.note.setValue(fetchedNote.noteText); // Set the note
        this.clientNoteIsNull = false;
      },
      error: (error: any) => {
        this.clientNoteIsNull = true;
        // if(error.statusCode === 404) {
        //   console.log("Note not found.");
        // }
      }
    });
    
}
}
