import * as uuid from 'uuid';
import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Review } from './review.model';
import { Subscription, Subject } from 'rxjs';
import { DataStorageService } from '../shared/services/data-storage-service/data-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  reviewsChanged = new Subject<Review[]>();
  subscription: Subscription;
  private currentRestaurantId: string;
  private reviews: Review[] = [];
  constructor(private dataStorageService: DataStorageService) { }

  async getReviews() {
    this.reviews = await this.dataStorageService.getReviews(this.currentRestaurantId);
    return this.reviews.slice();
  }

  async postReview(
      nickName: string,
      rating: string,
      description: string,
      userId: string
    ) {
      const timestamp = new Date().toISOString();
      const reviewId = uuid.v4();
      const result = await this.dataStorageService.postReview(
        this.currentRestaurantId,
        timestamp,
        reviewId,
        nickName,
        rating,
        description,
        userId
      );
      this.reviews.push(
        {
          restaurantId : this.currentRestaurantId,
          timestamp,
          reviewId,
          nickName,
          rating,
          description,
          userId
        }
      );
      this.reviewsChanged.next(this.reviews.slice());
  }

  async setCurrentRestaurant(restaurantId: string) {
    console.log(`In reviews service setting restaurant Id to: ${restaurantId}`);
    this.currentRestaurantId = restaurantId;
  }

  setAttachmentUrl(reviewId: string, attachmentUrl: string) {
    const index = _.findIndex(this.reviews, (el) => {
      return el.reviewId === reviewId;
    });
    this.reviews[index].attachmentUrl = attachmentUrl;
  }
}
