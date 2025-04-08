import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { TemplateService } from '../../../services/template.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditDietsComponent } from '../../Diets/edit-diets/edit-diets.component';
import { ConfirmationWindowComponent } from '../../../components/confirmation-window/confirmation-window.component';
import { PaginationComponent } from '../../pagination/pagination.component';



@Component({
  selector: 'manage-templates',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, CommonModule, ConfirmationWindowComponent, PaginationComponent],
  templateUrl: './templates-management.html',
  styleUrls: ['./templates-management.css']
})
export class ManageTemplates implements OnInit {
  templateService = inject(TemplateService);
  toastr = inject(ToastrService);
  dialog = inject(MatDialog);
  router = inject(Router);
  
  // Templates data
  templates: any[] = [];
  filteredTemplates: any[] = [];
  selectedTemplate: any = null;
  
  // UI state
  isLoading: boolean = false;
  showDeleteConfirmation: boolean = false;
  templateToDeleteId: string | null = null;
  deleteSuccessMessage: string | null = null;
  errorMessage: string | null = null;
  
  // Pagination
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  pagedItems: any[] = [];
  
  // Search and filter
  searchControl = new FormControl('');
  dateSearchForm = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl('')
  });
  
  ngOnInit(): void {
    this.loadTemplates();
    
    // Setup search subscription
    this.searchControl.valueChanges.subscribe(() => {
      this.filterTemplates();
    });
    
    // Setup date filter subscription
    this.dateSearchForm.valueChanges.subscribe(() => {
      this.filterTemplates();
    });
  }
  
  loadTemplates(): void {
    this.isLoading = true;
    this.templateService.fetchTemplates().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Handle different response formats
        if (response && response.data) {
          this.templates = response.data;
        } else if (Array.isArray(response)) {
          this.templates = response;
        } else if (response) {
          this.templates = [response];
        } else {
          this.templates = [];
        }
        
        this.filterTemplates();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = "Failed to load templates. Please try again.";
        console.error("Error loading templates:", error);
      }
    });
  }
  
  filterTemplates(): void {
    let filtered = [...this.templates];
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply date filters
    const startDate = this.dateSearchForm.get('startDate')?.value;
    const endDate = this.dateSearchForm.get('endDate')?.value;
    
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(template => 
        new Date(template.dateCreated) >= start
      );
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // Set to end of day
      filtered = filtered.filter(template => 
        new Date(template.dateCreated) <= end
      );
    }
    
    this.filteredTemplates = filtered;
    this.totalItems = filtered.length;
    this.loadPage(1);
  }
  
  loadPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedItems = this.filteredTemplates.slice(startIndex, endIndex);
  }
  
  onPageChanged(newPage: number): void {
    this.loadPage(newPage);
  }
  
  viewTemplateDetails(template: any): void {
    this.selectedTemplate = null; // Reset first to trigger change detection
    
    this.templateService.fetchTemplateById(template.id).subscribe({
      next: (response: any) => {
        const fullTemplate = response.data || response;
        this.selectedTemplate = fullTemplate;
      },
      error: (error) => {
        this.errorMessage = "Failed to load template details. Please try again.";
        console.error("Error loading template details:", error);
      }
    });
  }
  
  closeDetails(): void {
    this.selectedTemplate = null;
  }
  
  editTemplate(templateId: string): void {
    // Close the template details modal if open
    this.closeDetails();
    
    // Open the edit dialog
    const dialogRef = this.dialog.open(EditDietsComponent, {
      width: '90%',
      height: 'auto',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { dietId: templateId }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadTemplates(); // Refresh templates if edit was successful
      }
    });
  }
  
  openDeleteConfirmation(templateId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.templateToDeleteId = templateId;
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.templateToDeleteId = null;
  }
  
  confirmDelete(): void {
    if (this.templateToDeleteId) {
      this.templateService.deleteTemplate(this.templateToDeleteId).subscribe({
        next: () => {
          this.templates = this.templates.filter(template => template.id !== this.templateToDeleteId);
          this.showDeleteConfirmation = false;
          this.deleteSuccessMessage = "Template deleted successfully!";
          this.filterTemplates();
          
          // Clear the deletion-related variables after a delay
          setTimeout(() => {
            this.templateToDeleteId = null;
            this.deleteSuccessMessage = null;
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = "Failed to delete template. Please try again.";
          console.error("Error deleting template:", error);
          this.showDeleteConfirmation = false;
        }
      });
    }
  }
  
  createTemplate(): void {
    this.router.navigate(['/templates/add']);
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}