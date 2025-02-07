import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { DietType } from '../models/diet-type';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DietTypesService {

  private dietTypesSubject = new BehaviorSubject<DietType[]>([])
  private baseDietTypeUrl = environment.apiUrl + "diet-types";

  public dietTypes$ = this.dietTypesSubject.asObservable();



  constructor(private httpClient: HttpClient) {
    this.dietTypesSubject
  }

  loadDietTypes() {
    const baseUrl = this.baseDietTypeUrl

    if (this.dietTypesSubject.value.length > 0) {
      return of(this.dietTypesSubject.value)
    }
    
    return this.httpClient.get<DietType[]>(baseUrl).pipe(
      tap(dietTypes => this.dietTypesSubject.next(dietTypes)),
      // tap executes a function when the data arrives
    )
  }


}
