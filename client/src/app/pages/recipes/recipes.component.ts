import { Component, inject, OnInit } from '@angular/core';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { RecipesService } from '../../services/recipes.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeView } from '../../models/recipes/RecipeView';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ConfirmationWindowComponent } from "../../components/confirmation-window/confirmation-window.component";
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [NavBarComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css'
})
export class RecipesComponent implements OnInit {
  searchTerm: string = '';
  recipes: RecipeView[] = []; 

  accountService = inject(AccountService);
  
  isadmin = false;

  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.isadmin = this.accountService.userRole() === 'admin';
    this.recipeService.viewAllRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  filterRecipes(): void {
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
   
