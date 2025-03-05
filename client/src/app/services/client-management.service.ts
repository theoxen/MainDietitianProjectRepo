import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  getClientIdByPhoneNumber(phoneNumber: string) {
    const url = this.baseUrl + `users/${phoneNumber}/get-user-id`;
    return this.http.get<string>(url);
  }
}
