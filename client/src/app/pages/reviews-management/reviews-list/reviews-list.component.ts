import { Component, OnInit } from "@angular/core";
import { ReviewsToView } from "../../../models/reviews/reviews-to-view";
import { ReviewsService } from "../../../services/reviews.service";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "../../../services/account.service";
import { ToastrService } from "ngx-toastr";


@Component({
    selector: 'app-reviews-list',
    standalone: true, 
    imports: [CommonModule],
    templateUrl: './reviews-list.component.html',
    styleUrls: ['./reviews-list.component.css']
  })
  export class ReviewsListComponent implements OnInit {
    reviews: ReviewsToView[] = [];
    allReviews: ReviewsToView[] = [];
    currentPage: number = 0;
    pageSize: number = 5;
    loading: boolean = false;
    userReview: ReviewsToView | null = null;
    clientId: string | null = null;
    userId: string | null = null;
    totalReviews: number = 0;
    isNotAdmin: boolean = false;
    currentSort: 'best' | 'worst' | 'newest' | 'oldest' = 'best';
    
  
  
    constructor(
      private reviewsService: ReviewsService,
      private accountService: AccountService,
      private router: Router,
      private route: ActivatedRoute,
      private toastr: ToastrService // Inject ToastrService
    ){}
  
    ngOnInit(): void {
      this.isNotAdmin = this.accountService.userRole() === 'admin';
      this.fetchUserId();
      this.fetchAllReviews(); 
    }
  
    fetchAllReviews(): void {
      this.loading = true;
      this.reviewsService.getAllReviews().subscribe({
        next: (reviews: ReviewsToView[]) => {
          this.allReviews = reviews;
          this.totalReviews = reviews.length;
          this.currentPage = 0;
          this.reviews = []; 
          this.sortAndDisplay(); 
          this.loading = false;
        },
        error: (error: any) => {
          console.error("Error loading reviews.", error);
          this.toastr.error("Failed to load reviews. Please try again later.");
          this.loading = false;
        }
      });
    }
  
    loadMoreReviews(): void {
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      const nextPage = this.allReviews.slice(start, end);
      this.reviews = this.reviews.concat(nextPage);
      this.currentPage++;
    }
  
    sortAndDisplay(): void {
      switch (this.currentSort) {
        case 'best':
          this.allReviews.sort((a, b) => b.stars - a.stars);
          break;
        case 'worst':
          this.allReviews.sort((a, b) => a.stars - b.stars);
          break;
        case 'newest':
          this.allReviews.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
          break;
        case 'oldest':
          this.allReviews.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
          break;
      }
    
      this.currentPage = 0;
      this.reviews = [];
      this.loadMoreReviews();
    }
  
    sortReviews(event: Event): void {
      const selectElement = event.target as HTMLSelectElement;
      const order = selectElement.value as 'best' | 'worst' | 'newest' | 'oldest';
    
      this.currentSort = order;
      this.sortAndDisplay();
    }
  
    fetchUserId(): void {
      this.reviewsService.getLoggedInUserId().subscribe({
        next: (userId: string) => {
          this.userId = userId;
          this.checkUserReview();
        },
        error: (error: any) => {
          //console.error("Error fetching user ID.", error);
          //this.toastr.error("Error fetching user ID.");
        }
      });
    }
  
    checkUserReview(): void {
      if (this.userId) {
        this.reviewsService.getReviewsByUserId(this.userId).subscribe({
          next: (review: ReviewsToView) => {
            this.userReview = review;
          },
          error: (error: any) => {
            //console.error("Error fetching user review.", error);
            //this.toastr.error("Error fetching user review.");
          }
        });
      }
    }
  
    getUserToken(): string | null {
      const token = this.accountService.getUserToken();
      return token !== undefined ? token : null;   
    }
  
    hasMoreReviews(): boolean {
      return this.reviews.length < this.totalReviews;
    }
  
    addOrUpdateReview(): void {
      if (this.userReview) {
        this.router.navigate([`/reviews/${this.userReview.id}/edit`]);
      } else {
        this.router.navigate(['/reviews']);
      }
    }
  
    getStars(stars: number): string {
      return '★'.repeat(stars) + '☆'.repeat(5 - stars);
    }
  }
  