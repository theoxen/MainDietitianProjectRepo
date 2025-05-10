import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationMessages } from '../../../validation/validation-messages';
import { FormBuilder, FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { ReviewsService } from '../../../services/reviews.service';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { Reviews } from '../../../models/reviews/reviews';
import { ReviewsToAdd } from '../../../models/reviews/reviews-to-add';
import { CommonModule } from '@angular/common';
import { ReviewsToUpdate } from '../../../models/reviews/reviews-to-edit';
import { ToastrService } from 'ngx-toastr';



// Define the component metadata
@Component({
  selector: 'app-reviews-create-edit', // Component selector
  standalone: true, // Indicates this is a standalone component
  imports: [ReactiveFormsModule, NavBarComponent, CommonModule], // Modules to import
  templateUrl: './reviews-create-edit.component.html', // Template file
  styleUrls: ['./reviews-create-edit.component.css'], // Stylesheet file
})

// Define the component class
export class ReviewsCreateEditComponent implements OnInit {
  isConfirmationWindowVisible = false; // Flag to show/hide confirmation window
  clientId?: string; // Client ID from the route
  reviewId?: string; // Review ID from the route
  errorMessage: string = ""; // Error message to display
  reviews!: Reviews[]; // List of reviews
  stars: boolean[] = Array(5).fill(false); // Array to track star ratings
  isEditMode: boolean = false; // Flag to indicate edit mode

  // Define the review form with validation rules
  reviewForm = new FormGroup({
    "Stars": new FormControl<number>(0, [
      Validators.pattern(ValidationPatterns.stars), // Custom pattern validation
      Validators.required, // Field is required
      Validators.min(1), // Minimum value is 1
      Validators.max(5) // Maximum value is 5
    ]),
    "Review Text": new FormControl("", [
      Validators.pattern(ValidationPatterns.reviewText), // Custom pattern validation
      Validators.required // Field is required
    ]),
    "Anonymous": new FormControl<boolean>(false, [
      Validators.pattern(ValidationPatterns.anonymous), // Custom pattern validation
      Validators.required // Field is required
    ]),
  });

  displayErrorOnControlTouched = true; // Flag to show errors on control touch
  displayErrorOnControlDirty = true; // Flag to show errors on control dirty

  reviewsService = inject(ReviewsService); // Inject ReviewsService
  private toastr = inject(ToastrService); // Inject ToastrService for notifications

  // Constructor to inject route, form builder, and router
  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router) {}

  // Error messages for review text validation
  reviewTextErrorMessages = new Map<string, string>([
    // Add error messages if needed
  ]);

  // Error messages for star rating validation
  starsErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required], // Required field error
    ["min value is 1", ValidationMessages.ReviewMinValue], // Minimum value error
    ["max value is 5", ValidationMessages.ReviewMaxValue] // Maximum value error
  ]);

  // Error messages for anonymous field validation
  isAnonymousErrorMessages = new Map<string, string>([
    // Add error messages if needed
  ]);

  // Lifecycle hook to initialize the component
  ngOnInit(): void {
    // Initialize the form with default values and validation rules
    this.reviewForm = this.fb.group({
      Stars: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      'Review Text': [''],
      Anonymous: [false]
    });
    // Get the client ID from the route parameters
    this.clientId = this.route.snapshot.paramMap.get('clientId')!;
    // Subscribe to route parameter changes
    this.route.paramMap.subscribe(params => {
      const reviewId = params.get('reviewId'); // Get review ID from route
      this.reviewId = reviewId !== null ? reviewId : undefined; // Set review ID
      if (this.reviewId) {
        this.isEditMode = true; // Enable edit mode if review ID exists
        this.loadReviewDetails(this.reviewId); // Load review details
      }
    });
  }

  // Load review details for editing
  loadReviewDetails(reviewId: string): void {
    this.reviewsService.getReview(reviewId).subscribe({
      next: (review: Reviews) => {
        // Populate the form with review details
        this.reviewForm.controls['Stars'].setValue(review.stars);
        this.reviewForm.controls['Review Text'].setValue(review.reviewText);
        this.reviewForm.controls['Anonymous'].setValue(review.isAnonymous);
      },
      error: (error: any) => {
        // Handle error while loading review details
        console.error("Error loading review details.", error);
        this.errorMessage = "Error loading review details. Please try again later.";
        this.toastr.error("Error loading review details. Please try again later.");
      }
    });
  }

  // Set the star rating
  rate(rating: number): void {
    this.reviewForm.controls['Stars'].setValue(rating);
  }

  // Handle form submission
  onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched(); // Mark all fields as touched
      return;
    }
    if (this.isEditMode) {
      // Prepare data for updating a review
      const reviewsToUpdate: ReviewsToUpdate = {
        Id: this.reviewId!,
        stars: Number(this.reviewForm.controls['Stars'].value!),
        reviewText: this.reviewForm.controls['Review Text'].value!,
        isAnonymous: Boolean(this.reviewForm.controls['Anonymous'].value!)
      };

      // Call the service to update the review
      this.reviewsService.updateReview(reviewsToUpdate).subscribe({
        next: (review: Reviews) => {
          this.toastr.success("Review updated successfully."); // Show success message
          this.reviewId = review.id; // Update review ID
          this.router.navigate(['/']); // Navigate to home
        },
        error: (error: any) => {
          // Handle error while updating review
          console.error("Error updating review.", error);
          this.errorMessage = "Error updating review. Please try again later.";
          this.toastr.error("Error updating review. Please try again later.");
        }
      });
    } else {
      // Prepare data for adding a new review
      const reviewsToAdd: ReviewsToAdd = {
        stars: Number(this.reviewForm.controls['Stars'].value!),
        reviewText: this.reviewForm.controls['Review Text'].value!,
        isAnonymous: Boolean(this.reviewForm.controls['Anonymous'].value!)
      };

      // Call the service to create a new review
      this.reviewsService.createReview(reviewsToAdd).subscribe({
        next: () => {
          this.toastr.success("Review added successfully."); // Show success message
          this.router.navigate(['/']); // Navigate to home
        },
        error: (error: any) => {
          // Handle error while adding review
          console.error("Error adding review.", error);
          this.errorMessage = "Error adding review. Please try again later.";
          this.toastr.error("Error adding review. Please try again later.");
        }
      });
    }
  }

  // Open the confirmation window for delete action
  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }

  // Cancel the delete action
  cancelDelete(): void {
    this.isConfirmationWindowVisible = false;
  }

  // Handle delete action
  onDelete(): void {
    if (this.reviewId) {
      this.isConfirmationWindowVisible = false; // Hide confirmation window
      this.reviewsService.deleteReview(this.reviewId).subscribe({
        next: () => {
          this.toastr.success("Review deleted successfully."); // Show success message
          this.router.navigate(['/']); // Navigate to home
        },
        error: (error: any) => {
          // Handle error while deleting review
          console.error("Error deleting review.", error);
          this.errorMessage = "Error deleting review. Please try again later.";
          this.toastr.error("Error deleting review. Please try again later.");
        }
      });
    }
  }
}