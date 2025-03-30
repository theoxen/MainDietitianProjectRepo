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




@Component({
  selector: 'app-reviews-create-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NavBarComponent, CommonModule],
  templateUrl: './reviews-create-edit.component.html',
  styleUrls: ['./reviews-create-edit.component.css'],
})

export class ReviewsCreateEditComponent implements OnInit {
  isConfirmationWindowVisible = false;
  clientId?: string;
  reviewId?: string;
  errorMessage: string = "";
  reviews!: Reviews[];
  stars: boolean[] = Array(5).fill(false);
  isEditMode: boolean = false;

  reviewForm = new FormGroup({
    "Stars": new FormControl<number>(0, [
      Validators.pattern(ValidationPatterns.stars),
      Validators.required,
      Validators.min(1),
      Validators.max(5)
    ]),

    "Review Text": new FormControl("", [
      Validators.pattern(ValidationPatterns.reviewText),
      Validators.required
    ]),

    "Anonymous": new FormControl<boolean>(false, [
      Validators.pattern(ValidationPatterns.anonymous),
      Validators.required
    ]),
  })


  displayErrorOnControlTouched = true;
  displayErrorOnControlDirty = true;

  reviewsService = inject(ReviewsService);

constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router) {}

  reviewTextErrorMessages = new Map<string, string>([
  ]);

  starsErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["min value is 1", ValidationMessages.ReviewMinValue],
    ["max value is 5", ValidationMessages.ReviewMaxValue]
  ]);

  isAnonymousErrorMessages = new Map<string, string>([
  ]);

  
  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      Stars: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      'Review Text': [''],
      Anonymous: [false]
    });
    // Get the user ID from the URL
    this.clientId = this.route.snapshot.paramMap.get('clientId')!;  // Gets the user ID from the URL (In the app.routes.ts file, the path is defined as "clients/:clientId/note")
    this.route.paramMap.subscribe(params => {
      const reviewId = params.get('reviewId');
      this.reviewId = reviewId !== null ? reviewId : undefined;
      if (this.reviewId) {
        this.isEditMode = true;
        this.loadReviewDetails(this.reviewId);
      }
    });
  }


  loadReviewDetails(reviewId: string): void {
    this.reviewsService.getReview(reviewId).subscribe({
      next: (review: Reviews) => {
        this.reviewForm.controls['Stars'].setValue(review.stars);
        this.reviewForm.controls['Review Text'].setValue(review.reviewText);
        this.reviewForm.controls['Anonymous'].setValue(review.isAnonymous);
      },
      error: (error: any) => {
        console.error("Error loading review details.",error);
        this.errorMessage = "Error loading review details. Please try again later.";
      }
    });
  }

  rate(rating: number): void {
    this.reviewForm.controls['Stars'].setValue(rating);
  }

  onSubmit(): void {
    
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched(); // Mark all fields as touched to trigger validation messages
      return;
    }
      if (this.isEditMode) {
        const reviewsToUpdate: ReviewsToUpdate = {
          Id: this.reviewId!,
          stars: Number(this.reviewForm.controls['Stars'].value!),
          reviewText: this.reviewForm.controls['Review Text'].value!,
          isAnonymous: Boolean(this.reviewForm.controls['Anonymous'].value!)
        };

        this.reviewsService.updateReview(reviewsToUpdate).subscribe({
          next: (reviews : Reviews) => {
            console.log("Review updated successfully.");
            this.reviewId = reviews.id;
            this.router.navigate(['/']);
          },
          error: (error: any) => {
            console.error("Error updating review.", error);
            this.errorMessage = "Error updating review. Please try again later.";
          }
        });
      } else {
        const reviewsToAdd: ReviewsToAdd = {
          stars: Number(this.reviewForm.controls['Stars'].value!),
          reviewText: this.reviewForm.controls['Review Text'].value!,
          isAnonymous: Boolean(this.reviewForm.controls['Anonymous'].value!)
        };

        this.reviewsService.createReview(reviewsToAdd).subscribe({
          next: () => {
            console.log("Review added successfully.");
            this.router.navigate(['/']);
          },
          error: (error: any) => {
            console.error("Error adding review.", error);
            this.errorMessage = "Error adding review. Please try again later.";
          }
        });
      }
  }

  openConfirmationWindow() {
    this.isConfirmationWindowVisible = true;
  }

  cancelDelete(): void {
    this.isConfirmationWindowVisible = false;
  }

  onDelete(): void {
    if (this.reviewId) {
      this.isConfirmationWindowVisible = false;
      this.reviewsService.deleteReview(this.reviewId).subscribe({
        next: () => {
          console.log("Review deleted successfully.");
          this.router.navigate(['/']);
        },
        error: (error: any) => {
          console.error("Error deleting review.", error);
          this.errorMessage = "Error deleting review. Please try again later.";
        }
      });
    
  }
  }
}