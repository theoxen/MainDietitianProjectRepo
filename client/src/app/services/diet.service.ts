import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Diet } from '../models/diets/diet';
import { environment } from '../environments/environment';
import { DietToAdd } from '../models/diets/diets-to-add';
import { DietToEdit } from '../models/diets/diets-to-edit';
import { catchError } from 'rxjs';
import { Observable } from 'rxjs';
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


  fetchDietsForUser(clientId: string) {
    // Replace with an HTTP call or dummy data as needed. For example:
    return of([
      {
        // Adjust the property names to match your model.
        dietDays: [
          { dayName: 'Monday', DietMeals: [{ MealType: 'ΠΡΩΙΝΟ', meal: 'Oatmeal' }, { MealType: 'ΜΕΣΗΜΕΡΙΑΝΟ', meal: 'Salad' }] },
          { dayName: 'Tuesday', DietMeals: [{ MealType: 'ΠΡΩΙΝΟ', meal: 'Eggs' }, { MealType: 'ΜΕΣΗΜΕΡΙΑΝΟ', meal: 'Chicken' }] }
        ]
      }
    ]);
  }
  

  // Fetch a particular diet by its ID
  fetchDietById(dietId: string): Observable<Diet> {
    const url = `${this.baseUrl}diets/${dietId}`;
    console.log('Fetching diets from:', url);             // TO BE REMOVE - USED FOR DEBUGGING (NIKITAS)
    return this.http.get<Diet>(url);
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