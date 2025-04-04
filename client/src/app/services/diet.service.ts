import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Diet } from '../models/diets/diet';
import { environment } from '../environments/environment';
import { DietToAdd } from '../models/diets/diets-to-add';
import { DietToEdit } from '../models/diets/diets-to-edit';
import { catchError, of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DietService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }



  // fetchDietsForUser(userId: string): Observable<Diet[]> {
  //   const url = `${this.baseUrl}diets/client/${userId}`;
  //   return this.http.get<Diet[]>(url);
  // }



  
 // fetchDietsForUser(clientId: string):Observable<Diet[]> 


   fetchDietsForUser(clientId: string) {
     const url = this.baseUrl + 'diets/search';
     let params = new HttpParams().set('userId', clientId);
     return this.http.get<Diet[]>(url, { params });
   }
  

  // Fetch a particular diet by its ID
  fetchDietById(dietId: string): Observable<Diet> {
    const url = `${this.baseUrl}diets/${dietId}`;
    return this.http.get<Diet>(url);
  }

  // Fetch all diets
  fetchAllDiets(): Observable<Diet[]> {
    const url = this.baseUrl + 'diets';
    return this.http.get<Diet[]>(url);
  }

  // Add a new diet
  addDiet(diet: DietToAdd): Observable<Diet> {
    const url = this.baseUrl + 'diets';
    return this.http.post<Diet>(url, diet);
  }

  // Edit an existing diet
  editDiet(dietToEdit: DietToEdit): Observable<Diet> {
    const url = this.baseUrl + 'diets';
    return this.http.put<Diet>(url, dietToEdit);
  }

  // Delete a diet by its ID
  deleteDiet(dietId: string): Observable<any> {
    const url = this.baseUrl + `diets/${dietId}`;
    return this.http.delete(url);
  }

  // Search diets based on a userId and an optional date
  searchDiets(userId: string, date?: Date): Observable<Diet[]> {
    const url = this.baseUrl + 'diets/search';
    let params = new HttpParams().set('userId', userId);
    if (date) {
      params = params.set('date', date.toISOString());
    }
    return this.http.get<Diet[]>(url, { params });
  }
}