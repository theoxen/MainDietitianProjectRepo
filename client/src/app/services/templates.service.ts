import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Template } from '../models/templates/template';
import { TemplateBrief } from '../models/templates/template-brief';
import { TemplateToAdd } from '../models/templates/template-to-add';
import { TemplateToEdit } from '../models/templates/template-to-edit';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Create a new template
  createTemplate(template: TemplateToAdd): Observable<Template> {
    const url = `${this.baseUrl}templates`;
    return this.http.post<Template>(url, template);
  }

  // Update an existing template
  updateTemplate(template: TemplateToEdit): Observable<Template> {
    const url = `${this.baseUrl}templates`;
    return this.http.put<Template>(url, template);
  }

  // Get template by ID
  getTemplateById(id: string): Observable<Template> {
    const url = `${this.baseUrl}templates/${id}`;
    return this.http.get<Template>(url);
  }

  // Get all templates (brief version)
  fetchTemplates(): Observable<TemplateBrief[]> {
    const url = `${this.baseUrl}templates`;
    return this.http.get<TemplateBrief[]>(url);
  }

  // Delete a template by ID
  deleteTemplate(id: string): Observable<void> {
    const url = `${this.baseUrl}templates/${id}`;
    return this.http.delete<void>(url);
  }



}