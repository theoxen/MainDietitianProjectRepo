import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Metrics } from '../models/metrics/metrics';
import { environment } from '../environments/environment';
import { MetricsToAdd } from '../models/metrics/metrics-to-add';
import { MetricsToEdit } from '../models/metrics/metrics-to-edit';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  fetchMetricsForUser(clientId: string) {
    const url = this.baseUrl + 'metrics/search';
    let params = new HttpParams().set('userId', clientId);
    return this.http.get<Metrics[]>(url, { params });

  }

  fetchMetricsWithMetricsId(metricsId: string) {
    const url = `${this.baseUrl}metrics/${metricsId}`;
    return this.http.get<Metrics>(url); // Get request to fetch metrics by ID
}

  addMetrics(metrics: MetricsToAdd) {
    const url = this.baseUrl + 'metrics';
    return this.http.post<Metrics>(url, metrics); // Post request to add a new metric
  }

  editMetrics(metricsToEdit: MetricsToEdit) {
    const url = this.baseUrl + `metrics`;
    return this.http.put<Metrics>(url, metricsToEdit); // Put request to edit an existing metric
  }

  deleteMetrics(metricsId: string) {
    const url = this.baseUrl + `metrics/${metricsId}`;
    return this.http.delete<Metrics>(url); // Delete request to remove a metric
  }

  searchMetrics(userId: string, date?: Date) {
    const url = this.baseUrl + 'metrics/search';
    let params = new HttpParams().set('userId', userId);
    if (date) {
      params = params.set('date', date.toISOString());
    }
    return this.http.get<Metrics[]>(url, { params }); // Get request to search metrics
  }
}