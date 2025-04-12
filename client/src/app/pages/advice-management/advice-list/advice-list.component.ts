import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ConfirmationWindowComponent } from "../../../components/confirmation-window/confirmation-window.component";
import { NavBarComponent } from "../../../components/nav-bar/nav-bar.component";
import { AdviceToAdd } from "../../../models/advice/advice-to-add";
import { AdviceToUpdate } from "../../../models/advice/advice-to-edit";
import { AdviceToView } from "../../../models/advice/advice-to-view";
import { AdviceService } from "../../../services/advice.service";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AccountService } from "../../../services/account.service";

@Component({
  selector: 'app-advice-list',
  standalone: true,
  imports: [CommonModule, NavBarComponent, ConfirmationWindowComponent, FormsModule],
  templateUrl: './advice-list.component.html',
  styleUrls: ['./advice-list.component.css']
})
export class AdviceListComponent implements OnInit {
  constructor(private router: Router, private accountService: AccountService) {}
  // Services
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private adviceService = inject(AdviceService);

  // Properties
  adviceList: AdviceToView[] = [];
  filteredAdvice: AdviceToView[] = [];
  searchTerm: string = '';
  dateFilter: string = 'all';

  // Modal properties
  showAdviceViewModal: boolean = false;
  selectedAdvice: AdviceToView | null = null;

  // Form for adding/editing advice
  isAdmin: boolean = false;
  adviceForm!: FormGroup;
  isEditing: boolean = false;
  currentAdviceId: string | null = null;
  isSubmitting: boolean = false;


  ngOnInit(): void {
    this.isAdmin = this.accountService.userRole() === 'admin';
    this.initializeForm();
    this.loadAdvice();
  }

  // Initialize the form
  initializeForm(): void {
    this.adviceForm = this.fb.group({
      title: ['', [Validators.required]],
      adviceText: ['', [Validators.required]]
    });
  }

  // Load all advice from API
  loadAdvice(): void {
    this.adviceService.getAllAdvice().subscribe({
      next: (data) => {
        this.adviceList = data;
        this.filteredAdvice = [...data];
      },
      error: (error) => {
        console.error('Error loading advice', error);
        this.toastr.error('Failed to load advice. Please try again later.');
      }
    });
  }

  // Search advice by title
  searchAdvice(): void {
    if (!this.searchTerm?.trim()) {
      this.applyDateFilter(this.adviceList);
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    const filtered = this.adviceList.filter(advice =>
      advice.title.toLowerCase().includes(searchTermLower)
    );

    this.applyDateFilter(filtered);
  }

  // Filter advice by date
  filterByDate(): void {
    this.searchAdvice();
  }

  // Apply date filter to advice
  private applyDateFilter(adviceList: AdviceToView[]): void {
    if (!this.dateFilter || this.dateFilter === 'all') {
      this.filteredAdvice = adviceList;
      return;
    }
  
    let filtered = adviceList.filter(advice => {
      const adviceDate = new Date(advice.dateCreated);
      adviceDate.setHours(0, 0, 0, 0);  // Normalize the time to midnight
  
      switch (this.dateFilter) {
        // case 'today':
        //   const today = new Date();
        //   today.setHours(0, 0, 0, 0);
        //   return adviceDate.getTime() === today.getTime();  // Compare only the date part
        case 'week': {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return adviceDate >= weekAgo;
        }
        case 'month': {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return adviceDate >= monthAgo;
        }
        case 'newest': {
          // No filter needed for 'newest', we'll sort afterward
          return true;
        }
        case 'oldest': {
          // No filter needed for 'oldest', we'll sort afterward
          return true;
        }
        default:
          return true;
      }
    });
  
    // Now sort the filtered list based on 'newest' or 'oldest'
    if (this.dateFilter === 'newest') {
      this.filteredAdvice = filtered.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    } else if (this.dateFilter === 'oldest') {
      this.filteredAdvice = filtered.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
    } else {
      this.filteredAdvice = filtered;
    }
  }

  // View advice details in modal
  viewAdviceDetails(advice: AdviceToView): void {
    this.selectedAdvice = advice;
    this.showAdviceViewModal = true;
  }

  trackAdvice(index: number, advice: AdviceToView): string {
    return advice.id;  // Return the unique ID of each advice item
  }

  closeViewModal(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.showAdviceViewModal = false; // Close the modal by setting it to false
    this.selectedAdvice = null; // Reset the selected advice
  }

  // Open modal to add new advice
  goToAddAdvice(): void {
    this.router.navigate(['/advice']);  // Navigate to /advice
  }

  goToEditAdvice(adviceId: string): void {
    this.router.navigate([`/advice/${adviceId}/edit`]);  // Navigate to /advice/adviceId/edit
  }

  // Open modal to edit existing advice
  // editAdvice(advice: AdviceToView): void {
  //   this.isEditing = true;
  //   this.currentAdviceId = advice.id;

  //   this.adviceForm.patchValue({
  //     title: advice.title,
  //     adviceText: advice.adviceText
  //   });

  //   this.showAdviceViewModal = true;
  // }

  // Save advice (create or update)
  // saveAdvice(): void {
  //   if (this.adviceForm.invalid) {
  //     return;
  //   }

  //   this.isSubmitting = true;

  //   const { title, adviceText } = this.adviceForm.value;

  //   if (this.isEditing && this.currentAdviceId) {
  //     const updateAdvice: AdviceToUpdate = {
  //       id: this.currentAdviceId,
  //       title,
  //       adviceText
  //     };

  //     this.adviceService.updateAdvice(updateAdvice).subscribe({
  //       next: (updatedAdvice) => {
  //         const index = this.adviceList.findIndex(a => a.id === this.currentAdviceId);
  //         if (index !== -1) {
  //           this.adviceList[index] = updatedAdvice;
  //         }

  //         this.toastr.success('Advice updated successfully');
  //         this.searchAdvice(); // Refresh filtered advice
  //         this.showAdviceViewModal = false;
  //         this.adviceForm.reset();
  //         this.isSubmitting = false;
  //       },
  //       error: (error) => {
  //         console.error('Error updating advice', error);
  //         this.toastr.error('Failed to update advice. Please try again.');
  //         this.isSubmitting = false;
  //       }
  //     });
  //   } else {
  //     const newAdvice: AdviceToAdd = {
  //       title,
  //       adviceText
  //     };

  //     this.adviceService.createAdvice(newAdvice).subscribe({
  //       next: (addedAdvice) => {
  //         this.adviceList.unshift(addedAdvice);
  //         this.toastr.success('Advice added successfully');
  //         this.searchAdvice(); // Refresh filtered advice
  //         this.showAdviceViewModal = false;
  //         this.adviceForm.reset();
  //         this.isSubmitting = false;
  //       },
  //       error: (error) => {
  //         console.error('Error adding advice', error);
  //         this.toastr.error('Failed to add advice. Please try again.');
  //         this.isSubmitting = false;
  //       }
  //     });
  //   }
  // }

  // Open confirmation window for delete
  // openConfirmationWindow(adviceId: string) {
  //   this.isConfirmationWindowVisible = true;
  //   this.tempAdviceIdToDelete = adviceId;
  // }

  // // Handle delete confirmation
  // handleDeleteConfirmation(result: boolean) {
  //   this.isConfirmationWindowVisible = false;
  //   if (result) {
  //     this.adviceService.deleteAdvice(this.tempAdviceIdToDelete).subscribe({
  //       next: () => {
  //         this.adviceList = this.adviceList.filter(advice => advice.id !== this.tempAdviceIdToDelete);
  //         this.filteredAdvice = this.filteredAdvice.filter(advice => advice.id !== this.tempAdviceIdToDelete);
  //         this.tempAdviceIdToDelete = '';
  //         this.toastr.success('Advice deleted successfully');
  //       },
  //       error: (error) => {
  //         console.error('Error deleting advice', error);
  //         this.toastr.error('Failed to delete advice. Please try again.');
  //         this.tempAdviceIdToDelete = '';
  //       }
  //     });
  //   }
  // }
}