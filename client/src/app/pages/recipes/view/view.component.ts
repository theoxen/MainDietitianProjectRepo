import { Component, inject , OnInit } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from '../../../services/recipes.service';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent implements OnInit {
  recipesId: string | null = null;

  recipeService = inject(RecipesService);
  name?: string;
  description?: string;
  ingredients?: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  calories?: number;
  
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.recipesId = this.route.snapshot.paramMap.get('recipeId');
    if(this.recipesId){
      this.recipeService.viewRecipe(this.recipesId).subscribe({
        next: (recipe) => {
          this.name = recipe.name;
          this.description = recipe.directions;
          this.ingredients = recipe.ingredients;
          this.protein = recipe.protein;
          this.carbs = recipe.carbs;
          this.fats = recipe.fat;
          this.calories = recipe.calories;
        },
        error: (error) => {
          console.log(error);
        }
      });
    }

  }


}
