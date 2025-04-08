import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get all templates
  fetchTemplates(): Observable<any> {
    return this.http.get(`${this.baseUrl}templates`);
  }

  // Get template by ID
  fetchTemplateById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}templates/${id}`);
  }

  // Create a new template
  createTemplate(template: any): Observable<any> {
    return this.http.post(`${this.baseUrl}templates`, template);
  }

  // Update a template
  updateTemplate(template: any): Observable<any> {
    return this.http.put(`${this.baseUrl}templates`, template);
  }

  // Delete a template
  deleteTemplate(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}templates/${id}`);
  }
}