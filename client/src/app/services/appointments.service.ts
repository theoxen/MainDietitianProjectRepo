import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Metrics } from '../models/metrics/metrics';
import { environment } from '../environments/environment';
import { MetricsToAdd } from '../models/metrics/metrics-to-add';
import { MetricsToEdit } from '../models/metrics/metrics-to-edit';
import { catchError, Observable } from 'rxjs';
import { Diet } from '../models/diet';
import { AppointmentToAdd } from '../models/appointments/appointment-to-add';
import { AppointmentToEdit } from '../models/appointments/appointments-to-edit';
import { AnAppointment } from '../pages/calendar/calendar/calendar.component';
import { Appointment } from '../models/appointments/appointment';

const formatLocalDateTimeWithOffset = (date: Date) => { 
  const year = date.getFullYear(); 
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
  const day = date.getDate().toString().padStart(2, '0'); 
  const hours = date.getHours().toString().padStart(2, '0'); 
  const minutes = date.getMinutes().toString().padStart(2, '0'); 

  // getTimezoneOffset returns the difference (in minutes) between UTC and local time.  
  // Multiply offsetHours and offsetMinutes accordingly.
  const offsetMinutes = -date.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absOffsetMinutes / 60).toString().padStart(2, '0');
  const offsetRemainingMinutes = (absOffsetMinutes % 60).toString().padStart(2, '0');

  // Returns ISO string including local offset in a format that .NET can interpret correctly.
  return `${year}-${month}-${day}T${hours}:${minutes}:00${offsetSign}${offsetHours}:${offsetRemainingMinutes}`;
};

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  
  fetchDietForUser(dietId: string): Observable<Diet[]> {
    const url = `${this.baseUrl}diets/${dietId}`;
    return this.http.get<Diet[]>(url);
  }


  fetchAllAppointments(dateTime?: Date) {
    const url = this.baseUrl + 'appointments/search';
    let params = new HttpParams();
    
    if (dateTime) {
      params = params.set('dateTime', dateTime.toLocaleDateString());
    }
    
    return this.http.get<Appointment[]>(url, { params });
  } 

  cancelAppointment(appointmentId: string) {
    const url = this.baseUrl + `appointments/${appointmentId}`;
    return this.http.delete<Appointment>(url); // Delete request to remove a metric
  }

  addAppointment(appointment: AppointmentToAdd) {
    const url = this.baseUrl + 'appointments'; 
    return this.http.post<Appointment>(url, appointment); // Post request to add a new appointment
  }

  updateAppointment(appointmentsToEdit: AppointmentToEdit) {
    const url = this.baseUrl + `appointments`;
    return this.http.put<Appointment>(url, appointmentsToEdit); // Put request to edit an existing metric
  }

  


}