import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Note } from '../models/notes/note';
import { environment } from '../environments/environment';
import { NoteToAdd } from '../models/notes/note-to-add';
import { NoteToUpdate } from '../models/notes/note-to-edit';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  fetchNoteForUser(clientId: string) {
    const url = this.baseUrl + `users/${clientId}/note`;
    return this.http.get<Note>(url); // Get request on URL, and return type Note (from models/notes/note.ts the interface should contain the same properties as the response)
  }

  addNote(note: NoteToAdd) {
    const url = this.baseUrl + 'notes';
    return this.http.post<Note>(url, note);
  }

  updateNote(NoteToUpdate: NoteToUpdate) {
    const url = this.baseUrl + 'notes';
    return this.http.put<Note>(url, NoteToUpdate);
  }

  deleteNote(noteId: string) {
    const url = this.baseUrl + `notes/${noteId}`;
    return this.http.delete(url);
  }
}
