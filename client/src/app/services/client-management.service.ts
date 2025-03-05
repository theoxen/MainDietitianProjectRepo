import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { ClientProfile } from '../models/client-management/client-profile';

@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {
 
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }


  getClientDetails(clientId: string): Observable<ClientProfile> {
    return this.http.get<ClientProfile>(`${this.baseUrl}/view-profile/${clientId}`);
  }

  updateClient(clientId: string, client: ClientProfile): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/update-profile/${clientId}`, client);
  }

  deleteClient(clientId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-profile/${clientId}`);

  getClientIdByPhoneNumber(phoneNumber: string) {
    const url = this.baseUrl + `users/${phoneNumber}/get-user-id`;
    return this.http.get<string>(url);

  }
}
