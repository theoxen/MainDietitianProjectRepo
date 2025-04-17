import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PaginationComponent } from '../../pagination/pagination.component';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { TemplatesService } from '../../../services/templates.service';
import { AddTemplatesComponent } from '../add-templates/add-templates.component';
import { EditTemplatesComponent } from '../edit-templates/edit-templates.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  selector: 'view-templates',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, PaginationComponent, CommonModule],
  templateUrl: './view-templates.component.html',
  styleUrls: ['./view-templates.component.css']
})
export class ViewTemplatesComponent implements OnInit {





  dialog = inject(MatDialog);
  templateService = inject(TemplatesService);
  
  templates: any[] = [];
  transformedTemplates: any[] = [];
  filteredTemplates: any[] = [];
  pagedItems: any[] = [];
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  searchControl = new FormControl('');
  
  templateToDeleteId: string | null = null;
  showDeleteConfirmation = false;
  deleteSuccessMessage: string | null = null;
  selectedTemplate: any = null;
  dateSearchForm: FormGroup;
  
  constructor() {
    this.dateSearchForm = new FormGroup({
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });
  }
  
  ngOnInit(): void {
    this.fetchTemplates();
    this.searchControl.valueChanges.subscribe(value => {
      this.filteredTemplates = this.filterTemplates(value || '');
      this.totalItems = this.filteredTemplates.length;
      this.loadPage(1);
    });
  }
  
  fetchTemplates(): void {
    this.templateService.fetchTemplates().subscribe({
      next: (response: any) => {
        this.templates = Array.isArray(response) ? response : [response];
        this.transformTemplates();
        this.filteredTemplates = this.transformedTemplates;
        this.totalItems = this.filteredTemplates.length;
        this.loadPage(this.currentPage);
      },
      error: (error: any) => {
        console.error("Error fetching templates:", error);
        this.transformedTemplates = [];
        this.filteredTemplates = [];
        this.pagedItems = [];
        this.totalItems = 0;
      }
    });
  }
  
  transformTemplates(): void {
    this.transformedTemplates = this.templates.map(template => {
      const typedTemplate = { ...template };
      // Normalize date and days structure similar to diets
      if (typedTemplate.dateCreated && !typedTemplate.date) {
        typedTemplate.date = this.formatDate(typedTemplate.dateCreated);
      }
      if (typedTemplate.templateDays && !typedTemplate.Days) {
        typedTemplate.Days = typedTemplate.templateDays.map((day: any) => {
          if (day.meals && !day.Meals) {
            day.Meals = day.meals.map((meal: any) => ({
              Type: meal.mealType,
              Meal: meal.meal
            }));
          }
          return day;
        });
      }
      return {
        id: typedTemplate.id,
        date: typedTemplate.date || this.formatDate(new Date()),
        name: typedTemplate.name,
        isTemplate: true,
        fullTemplate: typedTemplate
      };
    });
  }
  
  formatDate(dateInput: string | Date): string {
    const dateObj = new Date(dateInput);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  filterTemplates(searchTerm: string): any[] {
    if (!searchTerm) {
      return this.transformedTemplates;
    }
    const term = searchTerm.toLowerCase();
    return this.transformedTemplates.filter(template =>
      template.name.toLowerCase().includes(term) ||
      template.date.includes(term)
    );
  }
  
  loadPage(page: number) {
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const reversedTemplates = [...this.filteredTemplates].reverse();
    this.pagedItems = reversedTemplates.slice(start, start + this.pageSize);
  }
  
  onPageChanged(newPage: number) {
    this.loadPage(newPage);
  }
  

  downloadTemplatePdf(): void {
    if (!this.selectedTemplate) return;
    const templateTable = document.querySelector('.horizontal-template-table') as HTMLElement;
    if (!templateTable) {
      console.error('Could not find template table element');
      alert('Error generating PDF: Table not found');
      return;
    }
    html2canvas(templateTable).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
      pdf.save(`template-${this.selectedTemplate.name}.pdf`);
    }).catch(error => {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    });
  }
  
  openEditTemplateModal(templateId: string): void {
    this.closeDetails();
    const dialogRef = this.dialog.open(EditTemplatesComponent, {
      width: '90%',
      height: 'auto',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { templateId }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.fetchTemplates();
      }
    });
  }
  
  openAddTemplateModal(): void {
    const dialogRef = this.dialog.open(AddTemplatesComponent, {
      width: '90%',
      height: 'auto',
      maxWidth: '1200px',
      maxHeight: '90vh'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.fetchTemplates();
      }
    });
  }
  
  openDeleteConfirmation(templateId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.templateToDeleteId = templateId;
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.templateToDeleteId = null;
    this.deleteSuccessMessage = null;
  }
  
  confirmDelete(): void {
    if (this.templateToDeleteId) {
      this.templateService.deleteTemplate(this.templateToDeleteId).subscribe({
        next: () => {
          this.selectedTemplate = null;
          this.showDeleteConfirmation = false;
          this.deleteSuccessMessage = "Template deleted successfully!";
          this.templates = this.templates.filter(t => t.id !== this.templateToDeleteId);
          this.transformTemplates();
          this.filteredTemplates = this.transformedTemplates;
          this.totalItems = this.filteredTemplates.length;
          this.loadPage(this.currentPage);
          setTimeout(() => {
            this.templateToDeleteId = null;
            this.deleteSuccessMessage = null;
          }, 1500);
        },
        error: (error) => {
          console.error("Error deleting template:", error);
          this.showDeleteConfirmation = false;
        }
      });
    }
  }
  
 
  getDayMeal(dayIndex: number, mealType: string): string {
    if (!this.selectedTemplate || !this.selectedTemplate.Days) {
      return '';
    }
  
    // Find the day with the right name based on index
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const targetDayName = dayNames[dayIndex];
    
    // Find the day object that matches the name we want
    const day = this.selectedTemplate.Days.find((d: any) => 
      (d.dayName === targetDayName || d.name === targetDayName));
    
    if (!day) {
      return '';
    }
    
    // Get meals for this day
    const meals = day.Meals || day.meals || [];
    
    // Find the meal with matching type
    const meal = meals.find((m: any) => {
      const mealTypeValue = m.Type || m.type || m.mealType || '';
      return mealTypeValue.toLowerCase() === mealType.toLowerCase();
    });
    
    return meal ? (meal.Meal || meal.meal || '') : '';
  }



  showTemplateDetails(template: any): void {
    this.templateService.getTemplateById(template.id).subscribe({
      next: (fullTemplate: any) => {
        this.selectedTemplate = fullTemplate;
        this.processSelectedTemplate();
      },
      error: (error) => {
        console.error('Error fetching template details:', error);
        // Fallback to using the basic template info
        this.selectedTemplate = template;
        this.processSelectedTemplate();
      }
    });
  }
  
  processSelectedTemplate(): void {
    if (!this.selectedTemplate) return;
    
    // Create a working copy of the template
    const processedTemplate = { ...this.selectedTemplate };
    if (!this.selectedTemplate) return;
  
    
    // Ensure the date is properly formatted
    if (!processedTemplate.date && processedTemplate.dateCreated) {
      processedTemplate.date = this.formatDate(processedTemplate.dateCreated);
    }
    
    // Handle various possible data structures
    if (!processedTemplate.Days) {
      // Try to find days data in other properties
      if (processedTemplate.templateDays) {
        processedTemplate.Days = processedTemplate.templateDays;
      } else if (processedTemplate.days) {
        processedTemplate.Days = processedTemplate.days;
      } else {
        // Create empty days array if none exists
        processedTemplate.Days = [];
      }
    }



    // Handle various possible data structures
    if (!processedTemplate.Days) {
      // Try to find days data in other properties
      if (processedTemplate.templateDays) {
        processedTemplate.Days = processedTemplate.templateDays;
      } else if (processedTemplate.days) {
        processedTemplate.Days = processedTemplate.days;
      } else {
        // Create empty days array if none exists
        processedTemplate.Days = [];
      }
    }
    
    // Ensure we have 7 days (one for each day of the week)
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' , 'Saturday','Sunday' ];
    for (let i = 0; i < 7; i++) {
      if (!processedTemplate.Days[i]) {
        processedTemplate.Days[i] = { 
          dayName: dayNames[i], 
          Meals: [] 
        };
      }
      
      // Normalize meals property
      if (!processedTemplate.Days[i].Meals && processedTemplate.Days[i].meals) {
        processedTemplate.Days[i].Meals = processedTemplate.Days[i].meals;
      } else if (!processedTemplate.Days[i].Meals) {
        processedTemplate.Days[i].Meals = [];
      }
      
      // Ensure all meal types exist for this day
      const mealTypes = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'];
      mealTypes.forEach(mealType => {
        // Check if this meal type already exists
        const existingMeal = processedTemplate.Days[i].Meals.find((meal: any) => {
          const type = meal.Type || meal.type || meal.mealType || '';
          return type.toLowerCase() === mealType.toLowerCase();
        });
        
        // If not, add an empty meal of this type
        if (!existingMeal) {
          processedTemplate.Days[i].Meals.push({
            Type: mealType,
            Meal: ''
          });
        }
      });
    }
    
    // Update the template with the processed version
    this.selectedTemplate = processedTemplate;
  }
 
  
  closeDetails(): void {
    this.selectedTemplate = null;
  }
}