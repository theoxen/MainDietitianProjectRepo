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
  imports: [NavBarComponent, PrimaryInputFieldComponent, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './add-edit-recipe.component.html',
  styleUrl: './add-edit-recipe.component.css'
})
export class AddEditRecipeComponent implements OnInit {
  recipes: RecipeAdd | null = null;
  isEditMode: boolean = false;
  recipesId: string | null = null;
  editrecipe: RecipeEdit | null = null;

  displayErrorOnControlDirty = true;
  displayErrorOnControlTouched = true;

  curentUrl!: string;
  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute) { }



  ngOnInit(): void {
    this.curentUrl = this.router.url
    if (this.curentUrl === "uploads/recipes/add") {
      this.isEditMode = false;
    }
    else {
      this.recipesId = this.route.snapshot.paramMap.get('recipeId');
    if (this.recipesId){
      this.isEditMode = true;
      this.recipeService.viewRecipe(this.recipesId).subscribe({
        next: (recipe) => {
          this.recipeForm.controls.name.setValue(recipe.name);
          this.recipeForm.controls.description.setValue(recipe.directions);
          this.recipeForm.controls.ingredients.setValue(recipe.ingredients);
          this.recipeForm.controls.protein.setValue(recipe.protein);
          this.recipeForm.controls.carbs.setValue(recipe.carbs);
          this.recipeForm.controls.fats.setValue(recipe.fat);
          this.recipeForm.controls.calories.setValue(recipe.calories);
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
    }
  }

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

  onSubmit() {
    if (this.isEditMode) {
      this.editRecipe();
    }
    else {
      if (!this.recipeForm.valid) {   //an den einai null

        if (!this.recipeForm.dirty) { //an den exei allaksei gia na min spamaroun oi malakes
          return;
        }
      }
      const recipes:RecipeAdd={
        name: this.recipeForm.controls.name.value ?? "",
        directions: this.recipeForm.controls.description.value ?? "",
        ingredients: this.recipeForm.controls.ingredients.value ?? "",
        protein: Number(this.recipeForm.controls.protein.value) ?? 0.0,
        carbs: Number(this.recipeForm.controls.carbs.value) ?? 0.0,
        fat: Number(this.recipeForm.controls.fats.value) ?? 0.0,
        calories: Number(this.recipeForm.controls.calories.value) ?? 0.0
      };

      this.recipeService.uploadRecipe(recipes).subscribe({
        next: (recipe) => {                   //an to request exei ginei swsta, parethesi ti ena mou epistepsi
          console.log(recipe);
          this.router.navigate(['/uploads/recipes']); 
        },
        error: (error) => {
          console.log(error);
        }
      })      
    }
  }


  editRecipe() {
    if (!this.recipeForm.dirty) {                         //an den exei allaksei gia na min spamaroun oi malakes
      return;
    }
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


    this.recipeService.EditRecipe(recipes).subscribe({
      next: (recipe) => {
        console.log(recipe);
        this.router.navigate(['/uploads/recipes', recipe.id]);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  
}
