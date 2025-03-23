import { Component, OnInit } from "@angular/core";
import { ReviewsToView } from "../../../models/reviews/reviews-to-view";
import { ReviewsService } from "../../../services/reviews.service";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "../../../services/account.service";


@Component({
    selector: 'app-reviews-list',
    standalone: true, 
    imports: [CommonModule],
    templateUrl: './reviews-list.component.html',
    styleUrls: ['./reviews-list.component.css']
  })
  export class ReviewsListComponent implements OnInit {
    reviews: ReviewsToView[] = [];
    currentPage: number = 0;
    pageSize: number = 5;
    loading: boolean = false;
    userReview: ReviewsToView | null = null;
    clientId: string | null = null;
  
  
    constructor(
      private reviewsService: ReviewsService,
      private accountService: AccountService,
      private router: Router,
      private route: ActivatedRoute,
      
      ) {}
  
    ngOnInit(): void {
      this.clientId = this.route.snapshot.paramMap.get('clientId');
      console.log("Client ID:", this.clientId); 
      this.loadMoreReviews();
      this.checkUserReview();
    }
  
    loadMoreReviews(): void {
      this.loading = true;
      this.reviewsService.getAllReviews().subscribe({
        next: (allReviews: ReviewsToView[]) => {
          const start = this.currentPage * this.pageSize;
          const end = start + this.pageSize;
          this.reviews = this.reviews.concat(allReviews.slice(start, end));
          this.currentPage++;
          this.loading = false;
        },
        error: (error: any) => {
          console.error("Error loading reviews.", error);
          this.loading = false;
        }
      });
    }

    checkUserReview(): void {
      console.log("checkUserReview called");
      if (this.clientId) {
        this.reviewsService.getReviewsByUserId(this.clientId).subscribe({
          next: (review: ReviewsToView) => {
            this.userReview = review;
            console.log("User review fetched:", this.userReview);
          },
          error: (error: any) => {
            console.error("Error fetching user review.", error);
          }
        });
      }
    }

    getUserToken(): string | null {
      const token = this.accountService.getUserToken();
      return token !== undefined ? token : null;
      
    }

    addOrUpdateReview(): void {
      if (this.userReview) {
        this.router.navigate([`/reviews/${this.userReview.reviewId}/edit`]);
      } else {
        this.router.navigate(['/reviews']);
      }
    }

    getStars(stars: number): string {
        return '★'.repeat(stars) + '☆'.repeat(5 - stars);
      }
  }