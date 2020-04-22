export interface Review {
    restaurantId: string;
    timestamp: string;
    reviewId: string;
    nickName: string;
    rating: string;
    description: string;
    userId: string;
    attachmentUrl?: string;
}
