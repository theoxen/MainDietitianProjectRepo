import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ReviewsToAdd } from '../models/reviews/reviews-to-add';
import { ReviewsToUpdate } from '../models/reviews/reviews-to-edit';
import { ReviewsToView } from '../models/reviews/reviews-to-view';
import { Reviews } from '../models/reviews/reviews';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private baseUrl = environment.apiUrl; // API base URL

  constructor(private http: HttpClient) { }

  // epikinona me to back end gia na anevaso ta recipes me to API url
  // Create a new review
  createReview(review: ReviewsToAdd) {
    const url = `${this.baseUrl}reviews`;
    return this.http.post<Reviews>(url, review);
  }

  // Update an existing review
  updateReview(ReviewToUpdate: ReviewsToUpdate) {
    const url = `${this.baseUrl}reviews/${ReviewToUpdate.Id}`;
    return this.http.put<Reviews>(url, ReviewToUpdate);
  }

  // Delete a review by ID
  deleteReview(id: string): Observable<void> {
    const url = `${this.baseUrl}reviews/${id}`;
    return this.http.delete<void>(url);
  }

  // Get a review by ID
  getReview(id: string): Observable<ReviewsToView> {
    const url = `${this.baseUrl}reviews/${id}`;
    return this.http.get<Reviews>(url);
  }

  // Search reviews by user full name
  searchReviews(userFullName: string): Observable<ReviewsToView[]> {
    const url = `${this.baseUrl}reviews/search?userFullName=${userFullName}`;
    return this.http.get<ReviewsToView[]>(url);
  }

  // Get all reviews
  getAllReviews(): Observable<ReviewsToView[]> {
    const url = `${this.baseUrl}reviews`;
    return this.http.get<ReviewsToView[]>(url);
  }

  // Get reviews by user ID
  getReviewsByUserId(userId: string): Observable<ReviewsToView> {
    const url = `${this.baseUrl}users/${userId}/review`;
    return this.http.get<ReviewsToView>(url);
  }
}