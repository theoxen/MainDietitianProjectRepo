import { Component, inject, OnInit } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { RecipesService } from '../../services/recipes.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeView } from '../../models/recipes/RecipeView';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [NavBarComponent, CommonModule, RouterModule,FormsModule],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css'
})
export class RecipesComponent implements OnInit {
  searchTerm: string = '';
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
  
  trackById(index: number, recipe: RecipeView): string {
    return recipe.id;
  }

  filterRecipes(): void {
    if (this.searchTerm.trim() === '') {
      this.recipeService.viewAllRecipes().subscribe({
        next: (recipes) => {
          this.recipes = recipes;
        },
        error: (error) => {
          console.log(error);
        }
      });
    } else {
      this.recipeService.searchRecipes(this.searchTerm).subscribe({
        next: (recipes) => {
          this.recipes = recipes;
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }
}
    

