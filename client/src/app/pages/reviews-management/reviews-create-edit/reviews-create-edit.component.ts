import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationMessages } from '../../../validation/validation-messages';
import { FormBuilder, FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { PrimaryInputFieldComponent } from '../../../components/primary-input-field/primary-input-field.component';
import { ReviewsService } from '../../../services/reviews.service';
import { ValidationPatterns } from '../../../validation/validation-patterns';
import { Reviews } from '../../../models/reviews/reviews';
import { ReviewsToAdd } from '../../../models/reviews/reviews-to-add';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-reviews-create-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NavBarComponent, PrimaryInputFieldComponent, CommonModule],
  templateUrl: './reviews-create-edit.component.html',
  styleUrls: ['./reviews-create-edit.component.css']
})

export class ReviewsCreateEditComponent implements OnInit {
  isConfirmationWindowVisible = false;
  clientId?: string;
  reviewId: string = "";
  errorMessage: string = "";
  reviews!: Reviews[];
  stars: boolean[] = Array(5).fill(false);

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

constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  reviewTextErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required]
  ]);

  starsErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required],
    ["min value is 1", ValidationMessages.ReviewMinValue],
    ["max value is 5", ValidationMessages.ReviewMaxValue]
  ]);

  isAnonymousErrorMessages = new Map<string, string>([
    ["required", ValidationMessages.required]
  ]);

  
  ngOnInit(): void {
    // Get the user ID from the URL
    this.clientId = this.route.snapshot.paramMap.get('clientId')!; // Gets the user ID from the URL (In the app.routes.ts file, the path is defined as "clients/:clientId/note")
    
    // if (this.clientId) {
    //   this.fetchMetricsForUser(this.clientId);
    // }
  }

  rate(rating: number): void {
    this.reviewForm.controls['Stars'].setValue(rating);
  }

  onSubmit(): void {
    if (this.reviewForm.valid) {
      const ReviewsToAdd: ReviewsToAdd = { // Assigning the values of the controls to the object to be sent to the service
        stars: Number(this.reviewForm.controls['Stars'].value!),
        reviewText: this.reviewForm.controls['Review Text'].value!,
        isAnonymous: Boolean(this.reviewForm.controls['Anonymous'].value!),
      };

      // Call service to add the review
    this.reviewsService.createReview(ReviewsToAdd).subscribe({
      next: (review: Reviews) => {
        console.log("Review added successfully.");
        this.reviewId = review.reviewId;
        this.reviewForm.reset();  // Clear the form after adding the review
      },
      error: (error: any) => {
        console.error("Error adding review.");
        this.errorMessage = "Error adding review. Please try again later.";
      }
    });
     
      // Handle form submission logic here
    } else {
      console.log('Form is invalid');
    }
  }
}