export interface Reviews {
    reviewId: string;
    stars: number;
    reviewText: string;
    isAnonymous: boolean;
    userId: string; 
    userFullName: string; 
    createdAt: Date; 
    updatedAt?: Date; // Optional for new reviews
  }