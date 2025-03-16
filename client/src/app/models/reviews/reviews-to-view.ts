export interface ReviewsToView {
    reviewId: string;
    stars: number;
    reviewText: string;
    isAnonymous: boolean;
    userId: string;
    userFullName: string;
    createdAt: Date;
    updatedAt?: Date;   //otpional
  }