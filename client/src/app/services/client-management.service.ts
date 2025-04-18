import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { ClientProfile } from '../models/client-management/client-profile';
import { ClientProfileUpdate } from '../models/client-management/client-update';
import { ClientProfileAllView } from '../models/client-management/client-view-profile';
import { Note } from '../models/notes/note';

@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {
 
  private baseUrl = environment.apiUrl;
  dateOfBirth: any;
  
  constructor(private http: HttpClient) { }


  getClientDetails(clientId: string) {
    const url = this.baseUrl + `users/view-profile/${clientId}`;
    return this.http.get<ClientProfile>(url);
  }

  updateClient(client: ClientProfileUpdate) {
    return this.http.put(`${this.baseUrl}users/`, client);
  }

  deleteClient(clientId: string){
    const url = this.baseUrl + `users/${clientId}`;
    return this.http.delete<void>(url);
  }

  getClientIdByPhoneNumber(phoneNumber: string) {
    const url = this.baseUrl + `users/${phoneNumber}/get-user-id`;
    return this.http.get<string>(url);

  }

  getAllClientDetails(clientId: string) {
    const url = this.baseUrl + `users/view-profile/${clientId}`;
    return this.http.get<ClientProfileAllView>(url);
  }

  getAllClients(): Observable<ClientProfile[]> {
    const url = this.baseUrl + 'users/all-clients';
    return this.http.get<ClientProfile[]>(url);
  }

  getAllClientsWithId(): Observable<ClientProfile[]> {
    const url = this.baseUrl + 'users/all-clients-withid';
    return this.http.get<ClientProfile[]>(url);
  }

  fetchNoteForUser(clientId: string) {
      const url = this.baseUrl + `users/${clientId}/note`;
      return this.http.get<Note>(url); // Get request on URL, and return type Note (from models/notes/note.ts the interface should contain the same properties as the response)
    }
}
