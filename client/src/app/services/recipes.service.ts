import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecipeAll } from '../models/recipes/RecipeAll';
import { RecipeAdd } from '../models/recipes/RecipeAdd';
import { environment } from '../environments/environment';
import { RecipeEdit } from '../models/recipes/RecipeEdit';
import { RecipeView } from '../models/recipes/RecipeView';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private baseUrl = environment.apiUrl;//API base url

  constructor(private http: HttpClient) { }//den exo idea giati


  // epikinona me to back end gia na anevaso ta recipes me to API url
  // Upload recipes
  uploadRecipe(recipe: RecipeAdd): Observable<any> { 
    const url = this.baseUrl + 'recipes';
    return this.http.post<RecipeAdd>(url, recipe);
  }

  deleteRecipe(id: string): Observable<void> {
    const url = `${this.baseUrl}recipes/${id}`;
    return this.http.delete<void>(url);
  }

  // Edit recipe by ID
  EditRecipe(recipe: RecipeEdit): Observable<RecipeEdit> {
    const url = `${this.baseUrl}recipes/${recipe.id}`;
    return this.http.put<RecipeEdit>(url, recipe);
  }

  // View recipe by ID
  viewRecipe(id: string): Observable<RecipeView> {
    const url = `${this.baseUrl}recipes/${id}`;
    return this.http.get<RecipeView>(url);
  }

  searchRecipes(search: string): Observable<RecipeAll[]> {
    const url = `${this.baseUrl}recipes/search?search=${encodeURIComponent(search)}`;
    return this.http.get<RecipeAll[]>(url);
  }


  // View all recipes
  viewAllRecipes(): Observable<RecipeAll[]> {
    const url = `${this.baseUrl}recipes`;
    return this.http.get<RecipeAll[]>(url);
 }
}
