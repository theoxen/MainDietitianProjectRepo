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
  // Search functionality property
  searchTerm: string = '';
  // Array to store all recipes
  recipes: RecipeView[] = []; 

  // Inject AccountService for user role verification
  accountService = inject(AccountService);
  
  // Flag to control admin-specific features
  isadmin = false;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 9; // Number of recipes shown per page
  totalPages: number = 1;
  paginatedRecipes: any[] = [];

  // Inject required services through constructor
  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute) { }

  // Lifecycle hook - runs when component initializes
  ngOnInit(): void {
    // Check if current user is admin
    this.isadmin = this.accountService.userRole() === 'admin';
    // Load all recipes on component initialization
    this.recipeService.viewAllRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.updatePagination();
      },
      error: (error) => {
        // console.log(error);
      }
    });
  }

  // Updates pagination based on current page and items per page
  // Calculates total pages and slices recipe array for current page
  updatePagination() {
    this.totalPages = Math.ceil(this.recipes.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRecipes = this.recipes.slice(startIndex, endIndex);
  }

  // Handles page navigation within valid page range
  // Updates displayed recipes when page changes
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // Filters recipes based on search term
  // Resets pagination to first page when search results update
  filterRecipes(): void {
    this.recipeService.searchRecipes(this.searchTerm).subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.currentPage = 1; // Reset to first page when filtering
        this.updatePagination();
      },
      error: (error) => {
        // console.log(error);
      }
    });
  }
}

