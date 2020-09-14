import { Injectable } from '@angular/core';
import { DataStorageService } from '../shared/services/data-storage-service/data-storage.service';
import { ReviewsService } from './reviews.service';

@Injectable({
  providedIn: 'root'
})
export class UploadImageService {
  private currentReviewId: string;
  private currentRestaurantId: string;
  private currentTimestamp: string;
  private currentAttachmentUrl: string;
  constructor( private dataStorageService: DataStorageService, private reviewsService: ReviewsService) { }

  async setCurrentReviewDetails(reviewId: string, restaurantId: string, timestamp: string) {
    console.log(`Setting current review details reviewId: ${reviewId} restaurantId: ${restaurantId} timestamp: ${timestamp}`);
    this.currentReviewId = reviewId;
    this.currentRestaurantId = restaurantId;
    this.currentTimestamp = timestamp;
  }

  async getUploadUrl(restaurantId: string, reviewId: string) {
    const result = await this.dataStorageService.getUploadUrl(
      restaurantId,
      reviewId
    );
    this.currentAttachmentUrl = result.attachmentUrl;
    return result.uploadUrl;
  }

  async uploadImage(selectedFile: File, uploadUrl: string) {
    try {
      await this.dataStorageService.uploadImage(selectedFile, uploadUrl);
      this.reviewsService.setAttachmentUrl(this.currentReviewId, this.currentAttachmentUrl);
    } catch (ex) {
      throw ex;
    }
  }

  getRestaurantId() {
    return this.currentRestaurantId;
  }

  getReviewId() {
    return this.currentReviewId;
  }

  getTimestamp() {
    return this.currentTimestamp;
  }
}
