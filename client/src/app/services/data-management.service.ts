import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataManagementService {

  private httpClient = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  constructor() { }

  backup() {
    return this.httpClient.post(this.baseUrl + "backup", {}, { responseType: 'blob', observe: 'response' });
  }

  restore(backupFile: File) {
    const formData = new FormData();
    formData.append('backupFile', backupFile, backupFile.name);
    
    return this.httpClient.post(
      `${this.baseUrl}restore`, 
      formData
    );
  }
}
