import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = environment.apiUrl;//API base url

  constructor(private http: HttpClient) { }//den exo idea giati

  // Fetch New Users Report
  fetchNewUsersReport(params: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/new-users`, { params });
  }

  // Fetch Age Report
  fetchAgeReport(params: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/age`, { params });
  }

  // Fetch Appointment Report
  fetchAppointmentReport(params: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/appointments`, { params });
  }

  // Fetch Diet Type Report
  fetchDietTypeReport(params: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/diet-type`, { params });
  }
}
