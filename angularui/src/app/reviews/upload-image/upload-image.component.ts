import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadImageService } from '../upload-image.service';
import { UploadUrlResponse } from 'src/app/shared/services/api-service/models/UploadUrlResponse';
import { Location } from '@angular/common';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})
export class UploadImageComponent implements OnInit, OnDestroy {
  reviewId;
  restaurantId;
  timestamp;
  key1 = 'reviewId';
  key2 = 'restaurantId';
  key3 = 'timestamp';
  selectedFile = null;
  response: UploadUrlResponse;
  uploadUrl: string;
  uploadSuccessful: boolean;
  constructor(
    private route: ActivatedRoute,
    private uploadImageService: UploadImageService,
    private location: Location
  ) { }

  ngOnInit() {
    this.restaurantId = this.uploadImageService.getRestaurantId();
    this.reviewId = this.uploadImageService.getReviewId();
    this.timestamp = this.uploadImageService.getTimestamp();
    this.getUploadUrl(this.restaurantId, this.timestamp, this.reviewId);
    this.uploadSuccessful = false;
  }

  async getUploadUrl(restaurantId: string, timestamp: string, reviewId: string) {
    this.uploadUrl = await this.uploadImageService.getUploadUrl(restaurantId, reviewId);
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
  }

  async onUpload() {
    try {
      await this.uploadImageService.uploadImage(this.selectedFile, this.uploadUrl);
      this.uploadSuccessful = true;
    } catch (ex) {
      console.log(`Upload Image failed. ${JSON.stringify(ex)}`);
    }
  }

  goBackToReviews() {
    this.location.back();
  }

  ngOnDestroy() {
  }

}
