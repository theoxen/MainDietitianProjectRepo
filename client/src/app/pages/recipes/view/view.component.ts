import { Component, inject , OnInit } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipesService } from '../../../services/recipes.service';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmationWindowComponent } from '../../../components/confirmation-window/confirmation-window.component';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [NavBarComponent, CommonModule, RouterModule, FormsModule, ConfirmationWindowComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent implements OnInit {
  recipesId: string | null = null;
  isConfirmationWindowVisible = false;
  RecipeisNull = false;
    
  Recipe = new FormGroup({
    recipe: new FormControl<string | null>(null)
  });

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


  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }
  
  handleDeleteConfirmation(result: boolean) {
    this.isConfirmationWindowVisible = false;
    if (result) {
      this.deleteRecipeid(this.recipesId);
    } else {
      console.log('Cancelled.');
    }
  }

  deleteRecipeid(recipeId: string | null): void {
    this.isConfirmationWindowVisible = false;
    if (recipeId) {
      this.recipeService.deleteRecipe(recipeId).subscribe({
        next: () => {
          console.log("Note deleted.");
          this.RecipeisNull = true;
          this.Recipe.controls.recipe.setValue(null);
          this.router.navigate(['/recipes']);
        },
        error: (error) => {
          console.log(error);
        }
      });
    } else {
      console.log('Delete operation cancelled.');
    }
  }


}
