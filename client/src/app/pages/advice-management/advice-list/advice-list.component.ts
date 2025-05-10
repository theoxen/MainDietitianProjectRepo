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
import { Router, RouterLink } from "@angular/router";
import { AccountService } from "../../../services/account.service";

@Component({
  selector: 'app-advice-list',
  standalone: true,
  imports: [CommonModule, NavBarComponent, ConfirmationWindowComponent, FormsModule, RouterLink],
  templateUrl: './advice-list.component.html',
  styleUrls: ['./advice-list.component.css']
})
export class AdviceListComponent implements OnInit {
  constructor(private router: Router, private accountService: AccountService) {}
  // Services
  private fb = inject(FormBuilder); // Inject FormBuilder for form creation
  private toastr = inject(ToastrService); // Inject ToastrService for notifications
  private adviceService = inject(AdviceService); // Inject AdviceService for API calls

  // Properties
  adviceList: AdviceToView[] = []; // List of all advice items
  filteredAdvice: AdviceToView[] = []; // Filtered advice list based on search or date filters
  searchTerm: string = ''; // Search term for filtering advice by title
  dateFilter: string = 'all'; // Date filter value (e.g., 'week', 'month', 'newest', etc.)

  // Modal properties
  showAdviceViewModal: boolean = false; // Flag to show/hide the advice details modal
  selectedAdvice: AdviceToView | null = null; // Currently selected advice for viewing

  // Form for adding/editing advice
  isAdmin: boolean = false; // Flag to check if the user is an admin
  adviceForm!: FormGroup; // Reactive form for adding/editing advice
  isEditing: boolean = false; // Flag to indicate if the form is in edit mode
  currentAdviceId: string | null = null; // ID of the advice being edited
  isSubmitting: boolean = false; // Flag to indicate if the form is being submitted

  ngOnInit(): void {
    // Check if the user is an admin
    this.isAdmin = this.accountService.userRole() === 'admin';
    // Initialize the reactive form
    this.initializeForm();
    // Load advice data from the API
    this.loadAdvice();
  }

  // Initialize the form with validation rules
  initializeForm(): void {
    this.adviceForm = this.fb.group({
      title: ['', [Validators.required]], // Title is required
      adviceText: ['', [Validators.required]] // Advice text is required
    });
  }

  // Load all advice from the API
  loadAdvice(): void {
    this.adviceService.getAllAdvice().subscribe({
      next: (data) => {
        this.adviceList = data; // Store the advice data
        this.filteredAdvice = [...data]; // Initialize the filtered list
      },
      error: (error) => {
        console.error('Error loading advice', error); // Log the error
        this.toastr.error('Failed to load advice. Please try again later.'); // Show error notification
      }
    });
  }

  // Search advice by title
  searchAdvice(): void {
    if (!this.searchTerm?.trim()) {
      // If no search term, apply only the date filter
      this.applyDateFilter(this.adviceList);
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim(); // Convert search term to lowercase
    const filtered = this.adviceList.filter(advice =>
      advice.title.toLowerCase().includes(searchTermLower) // Filter advice by title
    );

    this.applyDateFilter(filtered); // Apply date filter to the search results
  }

  // Filter advice by date
  filterByDate(): void {
    this.searchAdvice(); // Reapply search and date filters
  }

  // Apply date filter to the advice list
  private applyDateFilter(adviceList: AdviceToView[]): void {
    if (!this.dateFilter || this.dateFilter === 'all') {
      // If no date filter or 'all', show the full list
      this.filteredAdvice = adviceList;
      return;
    }
  
    let filtered = adviceList.filter(advice => {
      const adviceDate = new Date(advice.dateCreated);
      adviceDate.setHours(0, 0, 0, 0); // Normalize the time to midnight
  
      switch (this.dateFilter) {
        case 'week': {
          // Filter advice created within the last week
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return adviceDate >= weekAgo;
        }
        case 'month': {
          // Filter advice created within the last month
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
  
    // Sort the filtered list based on 'newest' or 'oldest'
    if (this.dateFilter === 'newest') {
      this.filteredAdvice = filtered.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    } else if (this.dateFilter === 'oldest') {
      this.filteredAdvice = filtered.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
    } else {
      this.filteredAdvice = filtered;
    }
  }

  // View advice details in a modal
  viewAdviceDetails(advice: AdviceToView): void {
    this.selectedAdvice = advice; // Set the selected advice
    this.showAdviceViewModal = true; // Show the modal
  }

  // Track advice items by their unique ID for better performance in *ngFor
  trackAdvice(index: number, advice: AdviceToView): string {
    return advice.id; // Return the unique ID of each advice item
  }

  // Close the advice details modal
  closeViewModal(event?: Event): void {
    if (event) {
      event.preventDefault(); // Prevent default behavior if an event is passed
    }
    this.showAdviceViewModal = false; // Close the modal
    this.selectedAdvice = null; // Reset the selected advice
  }

  // Navigate to the page for adding new advice
  goToAddAdvice(): void {
    this.router.navigate(['/uploads/advice']); // Navigate to /uploads/advice
  }

  // Navigate to the page for editing an existing advice
  goToEditAdvice(adviceId: string): void {
    this.router.navigate([`/uploads/advice/${adviceId}/edit`]); // Navigate to /uploads/advice/adviceId/edit
  }
}