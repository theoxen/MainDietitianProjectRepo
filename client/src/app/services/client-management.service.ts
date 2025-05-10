import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { ClientProfile } from '../models/client-management/client-profile';
import { ClientProfileUpdate } from '../models/client-management/client-update';
import { ClientProfileAllView } from '../models/client-management/client-view-profile';
import { Note } from '../models/notes/note';

/**
 * Service for managing client-related API calls.
 * Handles fetching, updating, deleting, and searching clients.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {
 
  // Base URL for API endpoints
  private baseUrl = environment.apiUrl;
  // (Unused) property for date of birth
  dateOfBirth: any;
  
  constructor(private http: HttpClient) { }

  /**
   * Get basic client details by client ID.
   * Used for displaying/editing a single client's profile.
   */
  getClientDetails(clientId: string) {
    const url = this.baseUrl + `users/view-profile/${clientId}`;
    return this.http.get<ClientProfile>(url);
  }

  /**
   * Update a client's profile information.
   * Expects a ClientProfileUpdate object.
   */
  updateClient(client: ClientProfileUpdate) {
    return this.http.put(`${this.baseUrl}users/`, client);
  }

  /**
   * Delete a client by their ID.
   */
  deleteClient(clientId: string){
    const url = this.baseUrl + `users/${clientId}`;
    return this.http.delete<void>(url);
  }

  /**
   * Get a client's ID by their phone number.
   * Used for searching clients by phone.
   */
  getClientIdByPhoneNumber(phoneNumber: string) {
    const url = this.baseUrl + `users/${phoneNumber}/get-user-id`;
    return this.http.get<string>(url);
  }

  /**
   * Get all details for a client by ID.
   * Used for the "view client" page.
   */
  getAllClientDetails(clientId: string) {
    const url = this.baseUrl + `users/view-profile/${clientId}`;
    return this.http.get<ClientProfileAllView>(url);
  }

  /**
   * Get a list of all clients (basic info).
   */
  getAllClients(): Observable<ClientProfile[]> {
    const url = this.baseUrl + 'users/all-clients';
    return this.http.get<ClientProfile[]>(url);
  }

  /**
   * Get a list of all clients, including their IDs.
   */
  getAllClientsWithId(): Observable<ClientProfile[]> {
    const url = this.baseUrl + 'users/all-clients-withid';
    return this.http.get<ClientProfile[]>(url);
  }

  /**
   * Fetch the note for a specific client by ID.
   * Used for displaying/editing client notes.
   */
  fetchNoteForUser(clientId: string) {
    const url = this.baseUrl + `users/${clientId}/note`;
    return this.http.get<Note>(url); // Get request on URL, and return type Note (from models/notes/note.ts the interface should contain the same properties as the response)
  }
}