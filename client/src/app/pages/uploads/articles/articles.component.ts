import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { AccountService } from '../../../services/account.service';
import { ArticlesService } from '../../../services/articles.service';
import { ReturnedArticle } from '../../../models/articles/returned-article';
import { AddArticle } from '../../../models/articles/add-article';
import { UpdateArticle } from '../../../models/articles/update-article';
import { ConfirmationWindowComponent } from "../../../components/confirmation-window/confirmation-window.component";
import { RouterLink } from '@angular/router';
  
@Component({
  selector: 'app-display-articles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavBarComponent, ConfirmationWindowComponent, RouterLink],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})

export class DisplayArticlesComponent implements OnInit {
  // Services
  accountService = inject(AccountService);
  userRole = this.accountService.userRole;
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private articlesService = inject(ArticlesService);
  isConfirmationWindowVisible = false;
  private tempArticleIdToDelete = '';
  
  // Properties for the articles
  articles: ReturnedArticle[] = [];
  filteredArticles: ReturnedArticle[] = [];
  
  // Search and filter properties
  searchTerm: string = '';
  dateFilter: string = 'all';
  
  // Add/Edit Modal properties
  showArticleModal: boolean = false;
  isEditing: boolean = false;
  isSubmitting: boolean = false;
  currentArticleId: string | null = null;
  
  // View Article Modal properties
  showArticleViewModal: boolean = false;
  selectedArticle: ReturnedArticle | null = null;
  
  // Form for adding/editing articles
  articleForm!: FormGroup;
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadArticles();
  }

  // Initialize the form
  initializeForm(): void {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      link: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  // Load articles from API
  loadArticles(): void {
    this.articlesService.getArticles()
      .subscribe({
        next: (articles) => {
          this.articles = articles;
          this.filteredArticles = [...articles];
        },
        error: (error) => {
          console.error('Error loading articles', error);
          this.toastr.error('Failed to load articles. Please try again later.');
        }
      });
  }

  // Search articles by title
  searchArticles(): void {
    if (!this.searchTerm?.trim()) {
      this.applyDateFilter(this.articles);
      return;
    }
    
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    const filtered = this.articles.filter(article => 
      article.title.toLowerCase().includes(searchTermLower)
    );
    
    this.applyDateFilter(filtered);
  }

  // Filter articles by date
  filterByDate(): void {
    this.searchArticles();
  }

  // Apply date filter to articles
  private applyDateFilter(articlesList: ReturnedArticle[]): void {
    if (!this.dateFilter || this.dateFilter === 'all') {
      this.filteredArticles = articlesList;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filtered = articlesList.filter(article => {
      const articleDate = new Date(article.dateCreated);
      articleDate.setHours(0, 0, 0, 0);
      
      switch (this.dateFilter) {
        case 'today':
          return articleDate.getTime() === today.getTime();
        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return articleDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return articleDate >= monthAgo;
        }
        default:
          return true;
      }
    });
    
    this.filteredArticles = filtered;
  }

  // Open modal to add a new article
  openAddArticleModal(): void {
    this.isEditing = false;
    this.currentArticleId = null;
    this.articleForm.reset();
    this.showArticleModal = true;
  }

  // Open modal to edit an existing article
  editArticle(article: ReturnedArticle): void {
    this.isEditing = true;
    this.currentArticleId = article.id;
    
    this.articleForm.patchValue({
      title: article.title,
      description: article.description,
      link: article.link
    });
    
    this.showArticleModal = true;
  }

  // View article details in modal
  viewArticleDetails(article: ReturnedArticle): void {
    this.selectedArticle = article;
    this.showArticleViewModal = true;
  }

  // Delete an article
  deleteArticle(id: string): void {
    
    
  }

  openConfirmationWindow(articleId: string) {
    this.isConfirmationWindowVisible = true;
    this.tempArticleIdToDelete = articleId; // Store the article ID to delete
  }

  handleDeleteConfirmation(result: boolean) {
    this.isConfirmationWindowVisible = false;
    if (result) {
      // Call service to delete the note
      // IF WE WANTED TO MANUALLY SUBMIT THE FORM AFTER THE CONFIRMATION WINDOW WE WOULD DO this.onSubmit(); 
      this.articlesService.deleteArticle(this.tempArticleIdToDelete)
      .subscribe({
        next: () => {
          this.articles = this.articles.filter(article => article.id !== this.tempArticleIdToDelete);
          this.filteredArticles = this.filteredArticles.filter(article => article.id !== this.tempArticleIdToDelete);
          this.tempArticleIdToDelete = ''; // Reset the temporary ID
          this.toastr.success('Article deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting article', error);
          this.toastr.error('Failed to delete article. Please try again.');
          this.tempArticleIdToDelete = ''; // Reset the temporary ID

        }
      });
    }
  }

  // Save article (create or update)
  saveArticle(): void {
    if (this.articleForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Get form values
    const { title, description, link } = this.articleForm.value;
    
    if (this.isEditing && this.currentArticleId) {
      // Create update article object
      const updateArticle: UpdateArticle = {
        id: this.currentArticleId,
        title,
        description,
        link
      };
      
      // Update existing article
      this.articlesService.updateArticle(updateArticle)
        .subscribe({
          next: (updatedArticle) => {
            // Find and update the article in the array
            const index = this.articles.findIndex(a => a.id === this.currentArticleId);
            if (index !== -1) {
              this.articles[index] = updatedArticle;
            }
            
            this.toastr.success('Article updated successfully');
            this.searchArticles(); // Refresh filtered articles
            this.showArticleModal = false;
            this.articleForm.reset();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating article', error);
            this.toastr.error('Failed to update article. Please try again.');
            this.isSubmitting = false;
          }
        });
    } else {
      // Create new article object
      const newArticle: AddArticle = {
        title,
        description,
        link
      };
      
      // Add new article
      this.articlesService.addArticle(newArticle)
        .subscribe({
          next: (addedArticle) => {
            // Add the new article to the array
            this.articles.unshift(addedArticle);
            
            this.toastr.success('Article added successfully');
            this.searchArticles(); // Refresh filtered articles
            this.showArticleModal = false;
            this.articleForm.reset();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error adding article', error);
            this.toastr.error('Failed to add article. Please try again.');
            this.isSubmitting = false;
          }
        });
    }
  }

  // Close the add/edit modal
  closeModal(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.showArticleModal = false;
  }

  // Close the article view modal
  closeViewModal(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.showArticleViewModal = false;
    this.selectedArticle = null;
  }
}