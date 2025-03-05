import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  GetClientIdByPhoneNumber(phoneNumber: string) {
    throw new Error('Method not implemented.');
  }
}
