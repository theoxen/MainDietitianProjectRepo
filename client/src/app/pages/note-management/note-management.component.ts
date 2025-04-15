import { Component, inject, OnInit } from '@angular/core';
import { ConfirmationWindowComponent } from "../../components/confirmation-window/confirmation-window.component";
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { NoteToAdd } from '../../models/notes/note-to-add';
import { Note } from '../../models/notes/note';
import { NoteToUpdate } from '../../models/notes/note-to-edit';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';


@Component({
  selector: 'app-note-management',
  standalone: true,
  imports: [ConfirmationWindowComponent, NavBarComponent, ReactiveFormsModule],
  templateUrl: './note-management.component.html',
  styleUrl: './note-management.component.css'
})
export class NoteManagementComponent implements OnInit {

  isConfirmationWindowVisible = false;
  clientId?: string;
  clientNoteIsNull = false;
  noteId: string = "";

  noteService = inject(NoteService);
  private toastr = inject(ToastrService);

  clientNote = new FormGroup({
    note: new FormControl<string | null>(null)
  });

  constructor(private route: ActivatedRoute,  private location: Location  ) { } // Required to use route.snapshot.paramMap to get the user ID from the URL

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.clientId = this.route.snapshot.paramMap.get('clientId')!; // Gets the user ID from the URL (In the app.routes.ts file, the path is defined as "clients/:clientId/note")
    this.fetchNoteForUser(this.clientId);
    // console.log(this.clientNote.controls.note.value); // Log the note for the user
  }



  fetchNoteForUser(clientId: string): void {

    // this.clientNote.controls.note.setValue("test"); // Set the note for the user

    // Implement your logic to fetch notes for the user
    this.noteService.fetchNoteForUser(clientId).subscribe({
      next: (fetchedNote) => {
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

  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }

  addNote() {
    if (this.clientNote.controls.note.value === null) {
      this.clientNote.controls.note.setValue("");
    }
    const NoteToAdd: NoteToAdd = { // Assigning the values of the controls to the object to be sent to the service
      noteText: this.clientNote.controls.note.value!,
      userId: this.clientId!
    }

    // Call service to add the note
    this.noteService.addNote(NoteToAdd).subscribe({
      next: (note: Note) => {
        this.toastr.success("Note added.");
        this.clientNoteIsNull = false;
        this.noteId = note.id;
      }
    })

  }

  editNote() {
    const NoteToUpdate: NoteToUpdate = { // Assigning the values of the controls to the object to be sent to the service
      noteText: this.clientNote.controls.note.value!,
      id: this.noteId!
    }
    // Call service to update the note
    this.noteService.updateNote(NoteToUpdate).subscribe({
      next: () => {
        this.toastr.success("Note updated.");
        this.clientNoteIsNull = false;
      }
    })
  }

  handleDeleteConfirmation(result: boolean) {
    this.isConfirmationWindowVisible = false;
    if (result) {
      // Call service to delete the note
      // IF WE WANTED TO MANUALLY SUBMIT THE FORM AFTER THE CONFIRMATION WINDOW WE WOULD DO this.onSubmit(); 
      this.noteService.deleteNote(this.noteId).subscribe({
        next: () => {
          this.toastr.success("Note deleted.");
          this.clientNoteIsNull = true;
          this.clientNote.controls.note.setValue(null);
        }
      });
    }
  }
  goBack(): void {
    this.location.back();
  }
  
}
