export interface ReviewsToView {
    id: string;
    stars: number;
    reviewText: string;
    isAnonymous: boolean;
    userId: string;
    userFullName: string;
    dateCreated: Date;
    updatedAt?: Date;
  }