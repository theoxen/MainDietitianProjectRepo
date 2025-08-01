import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { AccountService } from '../../../services/account.service';
import { Advice } from '../../../models/advice/advice';
import { ConfirmationWindowComponent } from "../../../components/confirmation-window/confirmation-window.component";
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../../pagination/pagination.component';
import { AdviceService } from '../../../services/advice.service';
import { AdviceToUpdate } from '../../../models/advice/advice-to-edit';
import { AdviceToAdd } from '../../../models/advice/advice-to-add';

@Component({
  selector: 'app-display-advices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavBarComponent, ConfirmationWindowComponent, RouterLink, PaginationComponent],
  templateUrl: './advice-list.component.html',
  styleUrl: './advice-list.component.css'
})

export class AdviceListComponent implements OnInit {
  // Services
  accountService = inject(AccountService);
  userRole = this.accountService.userRole;
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private advicesService = inject(AdviceService);
  isConfirmationWindowVisible = false;
  private tempAdviceToDelete = '';

  pagedAdvices: Advice[] = [];
  pageSize = 9; // 9 cards per page
  currentPage = 1;

  // Properties for the advices
  advices: Advice[] = [];
  filteredAdvices: Advice[] = [];

  // Search and filter properties
  searchTerm: string = '';
  dateFilter: string = 'all';

  // Add/Edit Modal properties
  showArticleModal: boolean = false;
  isEditing: boolean = false;
  isSubmitting: boolean = false;
  currentAdviceId: string | null = null;

  // View Article Modal properties
  showArticleViewModal: boolean = false;
  selectedArticle: Advice | null = null;

  // Form for adding/editing advices
  adviceForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.loadArticles();
  }

  loadPage(page: number): void {
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredAdvices.length);
    this.pagedAdvices = this.filteredAdvices.slice(startIndex, endIndex);
  }
  
  onPageChanged(newPage: number): void {
    this.currentPage = newPage;
    this.loadPage(newPage);
  }

  // Initialize the form
  initializeForm(): void {
    this.adviceForm = this.fb.group({
      title: ['', [Validators.required]],
      advice: ['', [Validators.required]]
    });
  }

  // Load advices from API
  loadArticles(): void {
  this.advicesService.getAllAdvice()
    .subscribe({
      next: (advices) => {
        this.advices = advices;
        this.filteredAdvices = [...advices];
        this.loadPage(1); // Initialize with first page
      },
      error: (error) => {
        console.error('Error loading advices', error);
        this.toastr.error('Failed to load advices. Please try again later.');
      }
    });
}

  // Search advices by title
  searchArticles(): void {
    if (!this.searchTerm?.trim()) {
      this.applyDateFilter(this.advices);
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    const filtered = this.advices.filter(advice =>
      advice.title.toLowerCase().includes(searchTermLower)
    );

    this.applyDateFilter(filtered);
  }

  // Filter advices by date
  filterByDate(): void {
    this.searchArticles();
  }

  // Apply date filter to advices
  private applyDateFilter(advicesList: Advice[]): void {
    if (!this.dateFilter || this.dateFilter === 'all') {
      this.filteredAdvices = advicesList;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const filtered = advicesList.filter(advice => {
        const adviceDate = new Date(advice.dateCreated);
        adviceDate.setHours(0, 0, 0, 0);
  
        switch (this.dateFilter) {
          case 'today':
            return adviceDate.getTime() === today.getTime();
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return adviceDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return adviceDate >= monthAgo;
          }
          default:
            return true;
        }
      });
  
    this.filteredAdvices = filtered;
      
    }
    this.loadPage(1);
    
  }

  // Open modal to add a new advice
  openAddArticleModal(): void {
    this.isEditing = false;
    this.currentAdviceId = null;
    this.adviceForm.reset();
    this.showArticleModal = true;
  }

  // Open modal to edit an existing advice
  editAdvice(advice: Advice): void {
    this.isEditing = true;
    this.currentAdviceId= advice.id;

    this.adviceForm.patchValue({
      title: advice.title,
      advice: advice.adviceText,
      created: advice.dateCreated
    });

    this.showArticleModal = true;
  }

  // View advice details in modal
  viewAdviceDetails(advice: Advice): void {
    this.selectedArticle = advice;
    this.showArticleViewModal = true;
  }

  // Delete an advice
  deleteAdvice(id: string): void {


  }

  openConfirmationWindow(adviceId: string) {
    this.isConfirmationWindowVisible = true;
    this.tempAdviceToDelete = adviceId; // Store the advice ID to delete
  }

  handleDeleteConfirmation(result: boolean) {
    this.isConfirmationWindowVisible = false;
    if (result) {
      // Call service to delete the note
      // IF WE WANTED TO MANUALLY SUBMIT THE FORM AFTER THE CONFIRMATION WINDOW WE WOULD DO this.onSubmit(); 
      this.advicesService.deleteAdvice(this.tempAdviceToDelete)
        .subscribe({
          next: () => {
            this.advices = this.advices.filter(advice => advice.id !== this.tempAdviceToDelete);
            this.filteredAdvices = this.filteredAdvices.filter(advice => advice.id !== this.tempAdviceToDelete);
            this.loadPage(this.currentPage); // Reload current page after deletion
            this.tempAdviceToDelete = '';
            this.toastr.success('Article deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting advice', error);
            this.toastr.error('Failed to delete advice. Please try again.');
            this.tempAdviceToDelete = ''; // Reset the temporary ID

          }
        });
    }
  }

  // Save advice (create or update)
  saveAdvice(): void {
    if (this.adviceForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Get form values
    const { title, adviceText } = this.adviceForm.value;

    if (this.isEditing && this.currentAdviceId) {
      // Create update advice object
      const updateAdvice: AdviceToUpdate = {
        id: this.currentAdviceId,
        title,
        adviceText
      };

      // Update existing advice
      this.advicesService.updateAdvice(updateAdvice)
        .subscribe({
          next: (updatedAdvice) => {
            // Find and update the advice in the array
            const index = this.advices.findIndex(a => a.id === this.currentAdviceId);
            if (index !== -1) {
              this.advices[index] = updatedAdvice;
            }

            this.toastr.success('Article updated successfully');
            this.searchArticles(); // Refresh filtered advices
            this.showArticleModal = false;
            this.adviceForm.reset();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating advice', error);
            this.toastr.error('Failed to update advice. Please try again.');
            this.isSubmitting = false;
          }
        });
    } else {
      // Create new advice object
      const newArticle: AdviceToAdd = {
        title,
        adviceText
      };

      // Add new advice
      this.advicesService.createAdvice(newArticle)
        .subscribe({
          next: (addedAdvice) => {
            // Add the new advice to the array
            this.advices.unshift(addedAdvice);

            this.toastr.success('Article added successfully');
            this.searchArticles(); // Refresh filtered advices
            this.showArticleModal = false;
            this.adviceForm.reset();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error adding advice', error);
            this.toastr.error('Failed to add advice. Please try again.');
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

  // Close the advice view modal
  closeViewModal(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.showArticleViewModal = false;
    this.selectedArticle = null;
  }
}