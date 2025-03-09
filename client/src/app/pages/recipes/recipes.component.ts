import { Component, inject, OnInit } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { RecipesService } from '../../services/recipes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeView } from '../../models/recipes/RecipeView';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css'
})
export class RecipesComponent implements OnInit {

  recipes: RecipeView[] = []; 

  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.recipeService.viewAllRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  openRecipeDetails(_t8: RecipeView) {
    throw new Error('Method not implemented.');
  }
  
  trackById(index: number, recipe: RecipeView): string {
    return recipe.id;
  }
    
}
