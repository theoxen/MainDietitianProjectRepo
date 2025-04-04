import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { ReportData } from '../models/Reports/ReportsData';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = environment.apiUrl;//API base url

  constructor(private http: HttpClient) { }//den exo idea giati

  // Fetch New Users Report
  fetchNewUsersReport(datestart: string, dateend: string): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.baseUrl}reports/users/${datestart}/${dateend}`);
  }

  // Fetch Age Group Report
  fetchAgeReport(agestart: number, ageend: number): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.baseUrl}reports/agegroup/${agestart}/${ageend}`);
  }

  // Fetch Appointment Report
  fetchAppointmentReport(datestart: string, dateend: string): Observable<any> {
    return this.http.get(`${this.baseUrl}reports/appointment/${datestart}/${dateend}`);
  }

  // Fetch Diet Type Report
  fetchDietTypeReport(dietTypeId: string): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.baseUrl}reports/userstype/${dietTypeId}`);
  }
}
