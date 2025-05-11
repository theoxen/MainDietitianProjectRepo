// Import necessary Angular core modules and custom components
import { Component, inject , OnInit } from '@angular/core';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipesService } from '../../../services/recipes.service';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmationWindowComponent } from '../../../components/confirmation-window/confirmation-window.component';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-view',
  standalone: true,
  // Import required modules and components for this component
  imports: [NavBarComponent, CommonModule, RouterModule, FormsModule, ConfirmationWindowComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent implements OnInit {
  // Store the recipe ID from URL parameters
  recipesId: string | null = null;
  // Control visibility of delete confirmation dialog
  isConfirmationWindowVisible = false;
  // Flag to handle null recipe states
  RecipeisNull = false;

  // Flag for admin-specific features
  isadmin = false;
    
  // Form group for recipe data handling
  Recipe = new FormGroup({
    recipe: new FormControl<string | null>(null)
  });

  // Inject required services using dependency injection
  recipeService = inject(RecipesService);
  accountService = inject(AccountService);

  // Properties to store recipe details
  name?: string;
  description?: string;
  ingredients?: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  calories?: number;
  
  // Constructor injection of required services
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  // Lifecycle hook - runs when component initializes
  ngOnInit(): void {
    // Get recipe ID from URL parameters
    this.recipesId = this.route.snapshot.paramMap.get('recipeId');

    // Check if current user is admin
    this.isadmin = this.accountService.userRole() === 'admin';
    
    // Load recipe details if ID exists
    if(this.recipesId){
      this.recipeService.viewRecipe(this.recipesId).subscribe({
        next: (recipe) => {
          // Populate component properties with recipe data
          this.name = recipe.name;
          this.description = recipe.directions;
          this.ingredients = recipe.ingredients;
          this.protein = recipe.protein;
          this.carbs = recipe.carbs;
          this.fats = recipe.fat;
          this.calories = recipe.calories;
        },
        error: (error) => {
          // console.log(error);
        }
      });
    }
  }

  // Show delete confirmation dialog
  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }
  
  // Handle user's delete confirmation response
  handleDeleteConfirmation(result: boolean) {
    this.isConfirmationWindowVisible = false;
    if (result) {
      this.deleteRecipeid(this.recipesId);
    } else {
      // console.log('Cancelled.');
    }
  }

  // Delete recipe and handle navigation after deletion
  deleteRecipeid(recipeId: string | null): void {
    this.isConfirmationWindowVisible = false;
    if (recipeId) {
      this.recipeService.deleteRecipe(recipeId).subscribe({
        next: () => {
          // Reset form and navigate back to recipes list
          this.RecipeisNull = true;
          this.Recipe.controls.recipe.setValue(null);
          this.router.navigate(['/uploads/recipes']);
        },
        error: (error) => {
          // console.log(error);
        }
      });
    } else {
      // console.log('Delete operation cancelled.');
    }
  }
}
