// Import necessary Angular modules and custom components/models
import { Component, OnInit } from '@angular/core';
import { RecipeAdd } from '../../../models/recipes/RecipeAdd';
import { RecipeEdit } from '../../../models/recipes/RecipeEdit';
import { RecipesService } from '../../../services/recipes.service';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { PrimaryInputFieldComponent } from "../../../components/primary-input-field/primary-input-field.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationMessages } from '../../../validation/validation-messages';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeView } from '../../../models/recipes/RecipeView';

@Component({
  selector: 'app-add-edit-recipe',
  standalone: true,
  // Required components and modules for form handling and routing
  imports: [NavBarComponent, PrimaryInputFieldComponent, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './add-edit-recipe.component.html',
  styleUrl: './add-edit-recipe.component.css'
})
export class AddEditRecipeComponent implements OnInit {
  // Properties to manage recipe state and edit mode
  recipes: RecipeAdd | null = null;
  isEditMode: boolean = false;
  recipesId: string | null = null;
  editrecipe: RecipeEdit | null = null;

  // Form validation display settings
  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  // Store current URL for routing logic
  curentUrl!: string;
  
  // Inject required services for recipe management and navigation
  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute) { }

  // Initialize component and handle edit/add mode
  ngOnInit(): void {
    this.curentUrl = this.router.url
    // Determine if we're adding or editing based on URL
    if (this.curentUrl === "uploads/recipes/add") {
      this.isEditMode = false;
    }
    else {
      // Get recipe ID from URL parameters for edit mode
      this.recipesId = this.route.snapshot.paramMap.get('recipeId');
      if (this.recipesId){
        this.isEditMode = true;
        // Load existing recipe data if in edit mode
        this.recipeService.viewRecipe(this.recipesId).subscribe({
          next: (recipe) => {
            // Populate form with existing recipe data
            this.recipeForm.controls.name.setValue(recipe.name);
            this.recipeForm.controls.description.setValue(recipe.directions);
            this.recipeForm.controls.ingredients.setValue(recipe.ingredients);
            this.recipeForm.controls.protein.setValue(recipe.protein);
            this.recipeForm.controls.carbs.setValue(recipe.carbs);
            this.recipeForm.controls.fats.setValue(recipe.fat);
            this.recipeForm.controls.calories.setValue(recipe.calories);
          },
          error: (error) => {
            // Handle error cases
          }
        });
      }
    }
  }

  // Form group definition with validation rules
  recipeForm = new FormGroup({
    "name": new FormControl("", [
      Validators.required
    ]),
    "description": new FormControl("", [
      Validators.required
    ]),
    "ingredients": new FormControl("", [
      Validators.required
    ]),
    "protein": new FormControl(0, [
      Validators.required,
      Validators.pattern(ValidationPatterns.floatPattern)
    ]),
    "carbs": new FormControl(0, [
      Validators.required,
      Validators.pattern(ValidationPatterns.floatPattern)
    ]),
    "fats": new FormControl(0, [
      Validators.required,
      Validators.pattern(ValidationPatterns.floatPattern)
    ]),
    "calories": new FormControl(0, [
      Validators.required,
      Validators.pattern(ValidationPatterns.floatPattern)
    ])
  })

  // Error message mappings for form validation
  nameErrorMessages = new Map<string, string>([
    ["required", "Name is required"],
    ["pattern", ValidationMessages.recipeName]
  ])

  descriptionErrorMessages = new Map<string, string>([
    ["required", "Description is required"],
    ["pattern", ValidationMessages.recipeDescription]
  ])

  ingredientsErrorMessages = new Map<string, string>([
    ["required", "Ingredients are required"],
    ["pattern", ValidationMessages.recipeIngredients]
  ])

  proteinErrorMessages = new Map<string, string>([
    ["required", "Protein is required"],
    ["pattern", ValidationMessages.recipeProtein]
  ])

  carbsErrorMessages = new Map<string, string>([
    ["required", "Carbs are required"],
    ["pattern", ValidationMessages.recipeCarbs]
  ])

  fatsErrorMessages = new Map<string, string>([
    ["required", "Fats are required"],
    ["pattern", ValidationMessages.recipeFats]
  ])

  caloriesErrorMessages = new Map<string, string>([
    ["required", "Calories are required"],
    ["pattern", ValidationMessages.recipeCalories]
  ])

  // Form submission handler - determines whether to add or edit
  onSubmit() {
    if (this.isEditMode) {
      this.editRecipe();
    }
    else {
      // Validation checks before adding new recipe
      if (!this.recipeForm.valid) {
        if (!this.recipeForm.dirty) {
          return;
        }
      }
      // Create new recipe object from form data
      const recipes:RecipeAdd = {
        name: this.recipeForm.controls.name.value ?? "",
        directions: this.recipeForm.controls.description.value ?? "",
        ingredients: this.recipeForm.controls.ingredients.value ?? "",
        protein: Number(this.recipeForm.controls.protein.value) ?? 0.0,
        carbs: Number(this.recipeForm.controls.carbs.value) ?? 0.0,
        fat: Number(this.recipeForm.controls.fats.value) ?? 0.0,
        calories: Number(this.recipeForm.controls.calories.value) ?? 0.0
      };

      // Send new recipe to server and handle response
      this.recipeService.uploadRecipe(recipes).subscribe({
        next: (recipe) => {                   //an to request exei ginei swsta, parethesi ti ena mou epistepsi
          // console.log(recipe);
          this.router.navigate(['/uploads/recipes']); 
        },
        error: (error) => {
          // console.log(error);
        }
      })      
    }
  }

  // Handle recipe updates in edit mode
  editRecipe() {
    // Prevent unnecessary updates if form hasn't changed
    if (!this.recipeForm.dirty) {                         //an den exei allaksei gia na min spamaroun oi malakes
      return;
    }
    // Create updated recipe object from form data
    const recipes:RecipeEdit={
      id: this.recipesId ?? "",
      name: this.recipeForm.controls.name.value ?? "",
      dateCreated: new Date(Date.now()),
      ingredients: this.recipeForm.controls.ingredients.value ?? "",
      directions: this.recipeForm.controls.description.value ?? "",
      protein: Number(this.recipeForm.controls.protein.value) ?? 0.0,
      carbs: Number(this.recipeForm.controls.carbs.value) ?? 0.0,
      fat: Number(this.recipeForm.controls.fats.value) ?? 0.0,
      calories: Number(this.recipeForm.controls.calories.value) ?? 0.0
    };

    // Send updated recipe to server and handle response
    this.recipeService.EditRecipe(recipes).subscribe({
      next: (recipe) => {
        // console.log(recipe);
        this.router.navigate(['/uploads/recipes', recipe.id]);
      },
      error: (error) => {
        // console.log(error);
      }
    })
  }
}
