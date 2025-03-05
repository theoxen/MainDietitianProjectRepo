import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {

  constructor(private http: HttpClient) { }

  GetClientIdByPhoneNumber(phoneNumber: string) {
    throw new Error('Method not implemented.');
  }
}
