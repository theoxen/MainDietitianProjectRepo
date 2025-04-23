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

  currentPage: number = 1;
  itemsPerPage: number = 9; // Changed from 6 to 9
  totalPages: number = 1;
  paginatedRecipes: any[] = [];

  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.isadmin = this.accountService.userRole() === 'admin';
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

  updatePagination() {
    this.totalPages = Math.ceil(this.recipes.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRecipes = this.recipes.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

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

