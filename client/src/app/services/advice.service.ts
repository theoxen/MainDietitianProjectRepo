import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import { AdviceToAdd } from "../models/advice/advice-to-add";
import { AdviceToUpdate } from "../models/advice/advice-to-edit";
import { Advice } from "../models/advice/advice";
import { AdviceToView } from "../models/advice/advice-to-view";

@Injectable({
    providedIn: 'root'
  })
  export class AdviceService {
    private baseUrl = environment.apiUrl;
  
    constructor(private http: HttpClient) { }
  
    // Create new advice
    createAdvice(advice: AdviceToAdd) {
      const url = `${this.baseUrl}advice`;
      return this.http.post<Advice>(url, advice);
    }
  
    // Update existing advice
    updateAdvice(AdviceToUpdate: AdviceToUpdate): Observable<Advice> {
      const url = `${this.baseUrl}advice/${AdviceToUpdate.id}`;
      return this.http.put<Advice>(url, AdviceToUpdate);
    }
  
    // Delete advice by ID
    deleteAdvice(id: string): Observable<void> {
      const url = `${this.baseUrl}advice/${id}`;
      return this.http.delete<void>(url);
    }
  
    // Get advice by ID
    getAdvice(id: string): Observable<AdviceToView> {
      const url = `${this.baseUrl}advice/${id}`;
      return this.http.get<AdviceToView>(url);
    }
  
    // Get all advice
    getAllAdvice(): Observable<AdviceToView[]> {
      const url = `${this.baseUrl}advice`;
      return this.http.get<AdviceToView[]>(url);
    }
  
    // Search advice by title
    searchAdvice(searchTerm: string): Observable<AdviceToView[]> {
      const url = `${this.baseUrl}advice/search?searchTerm=${searchTerm}`;
      return this.http.get<AdviceToView[]>(url);
    }
  }