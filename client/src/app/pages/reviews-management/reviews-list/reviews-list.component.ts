import { Component, OnInit } from "@angular/core";
import { ReviewsToView } from "../../../models/reviews/reviews-to-view";
import { ReviewsService } from "../../../services/reviews.service";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "../../../services/account.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-reviews-list', // Component selector
  standalone: true, // Indicates this component is standalone
  imports: [CommonModule], // Modules imported for this component
  templateUrl: './reviews-list.component.html', // HTML template
  styleUrls: ['./reviews-list.component.css'] // CSS styles
})
export class ReviewsListComponent implements OnInit {
  // Properties to manage reviews and pagination
  reviews: ReviewsToView[] = []; // Reviews to display
  allReviews: ReviewsToView[] = []; // All reviews fetched
  currentPage: number = 0; // Current page for pagination
  pageSize: number = 5; // Number of reviews per page
  loading: boolean = false; // Loading state
  userReview: ReviewsToView | null = null; // Current user's review
  clientId: string | null = null; // Client ID
  userId: string | null = null; // User ID
  totalReviews: number = 0; // Total number of reviews
  isNotAdmin: boolean = false; // Flag to check if user is not an admin
  currentSort: 'best' | 'worst' | 'newest' | 'oldest' = 'best'; // Current sorting order

  constructor(
      private reviewsService: ReviewsService, // Service to fetch reviews
      private accountService: AccountService, // Service to manage account-related data
      private router: Router, // Router for navigation
      private route: ActivatedRoute, // Activated route for route parameters
      private toastr: ToastrService // Toastr service for notifications
  ) {}

  // Lifecycle hook: Called when the component is initialized
  ngOnInit(): void {
      this.isNotAdmin = this.accountService.userRole() === 'admin'; // Check if the user is not an admin
      this.fetchUserId(); // Fetch the logged-in user's ID
      this.fetchAllReviews(); // Fetch all reviews
  }

  // Fetch all reviews from the service
  fetchAllReviews(): void {
      this.loading = true; // Set loading state to true
      this.reviewsService.getAllReviews().subscribe({
          next: (reviews: ReviewsToView[]) => {
              this.allReviews = reviews; // Store all reviews
              this.totalReviews = reviews.length; // Update total reviews count
              this.currentPage = 0; // Reset current page
              this.reviews = []; // Clear displayed reviews
              this.sortAndDisplay(); // Sort and display reviews
              this.loading = false; // Set loading state to false
          },
          error: (error: any) => {
              console.error("Error loading reviews.", error); // Log error
              this.toastr.error("Failed to load reviews. Please try again later."); // Show error notification
              this.loading = false; // Set loading state to false
          }
      });
  }

  // Load more reviews for pagination
  loadMoreReviews(): void {
      const start = this.currentPage * this.pageSize; // Calculate start index
      const end = start + this.pageSize; // Calculate end index
      const nextPage = this.allReviews.slice(start, end); // Get the next page of reviews
      this.reviews = this.reviews.concat(nextPage); // Append new reviews to the displayed list
      this.currentPage++; // Increment current page
  }

  // Sort reviews based on the selected order and display them
  sortAndDisplay(): void {
      switch (this.currentSort) {
          case 'best':
              this.allReviews.sort((a, b) => b.stars - a.stars); // Sort by best rating
              break;
          case 'worst':
              this.allReviews.sort((a, b) => a.stars - b.stars); // Sort by worst rating
              break;
          case 'newest':
              this.allReviews.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()); // Sort by newest
              break;
          case 'oldest':
              this.allReviews.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()); // Sort by oldest
              break;
      }

      this.currentPage = 0; // Reset current page
      this.reviews = []; // Clear displayed reviews
      this.loadMoreReviews(); // Load the first page of sorted reviews
  }

  // Handle sorting dropdown change event
  sortReviews(event: Event): void {
      const selectElement = event.target as HTMLSelectElement; // Get the selected element
      const order = selectElement.value as 'best' | 'worst' | 'newest' | 'oldest'; // Get the selected sorting order

      this.currentSort = order; // Update the current sorting order
      this.sortAndDisplay(); // Sort and display reviews
  }

  // Fetch the logged-in user's ID
  fetchUserId(): void {
      if (this.accountService.getUserToken()) { // Check if the user is logged in
          this.reviewsService.getLoggedInUserId().subscribe({
              next: (userId: string) => {
                  this.userId = userId; // Store the user ID
                  this.checkUserReview(); // Check if the user has a review
              },
              error: (error: any) => {
                  // Uncomment to log errors or show notifications
                  // console.error("Error fetching user ID.", error);
                  // this.toastr.error("Error fetching user ID.");
              }
          });
      }
  }

  // Check if the logged-in user has a review
  checkUserReview(): void {
      if (this.userId) { // Ensure the user ID is available
          this.reviewsService.getReviewsByUserId(this.userId).subscribe({
              next: (review: ReviewsToView) => {
                  this.userReview = review; // Store the user's review
              },
              error: (error: any) => {
                  // Uncomment to log errors or show notifications
                  // console.error("Error fetching user review.", error);
                  // this.toastr.error("Error fetching user review.");
              }
          });
      }
  }

  // Get the user's token
  getUserToken(): string | null {
      const token = this.accountService.getUserToken(); // Fetch the token
      return token !== undefined ? token : null; // Return the token or null
  }

  // Check if there are more reviews to load
  hasMoreReviews(): boolean {
      return this.reviews.length < this.totalReviews; // Compare displayed reviews with total reviews
  }

  // Navigate to add or update review page
  addOrUpdateReview(): void {
      if (this.userReview) { // If the user has a review
          this.router.navigate([`/reviews/${this.userReview.id}/edit`]); // Navigate to edit page
      } else {
          this.router.navigate(['/reviews']); // Navigate to add review page
      }
  }

  // Generate star rating string
  getStars(stars: number): string {
      return '★'.repeat(stars) + '☆'.repeat(5 - stars); // Create a string with filled and empty stars
  }
}