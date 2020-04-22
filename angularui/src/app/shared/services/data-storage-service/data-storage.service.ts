import { configuration } from '../../../config';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api-service/api.service';
import { Cuisine } from 'src/app/cuisines/cuisine.model';
import { Restaurant } from 'src/app/restaurants/restaurant.model';
import { GetReviewsResponse } from '../api-service/models/getReviewsResponse';
import { Review } from 'src/app/reviews/review.model';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  constructor(private apiService: ApiService, private http: HttpClient) { }

  async getCuisines(): Promise<Cuisine[]> {
    console.log(`In data storage service getCuisines`);
    const getCuisinesApiResponse =  await this.apiService.getCuisines$();
    return getCuisinesApiResponse.items;
  }

  async postCuisine(id: string, cuisineName: string) {
    console.log(`In data storage service postCuisine`);
    const result = await this.apiService.postCuisine$(id, cuisineName);
  }

  async getRestaurants(id: string): Promise<Restaurant[]> {
    console.log(`In data storage service getRestaurants`);
    const getRestaurantsApiResponse = await this.apiService.getRestaurants$(id);
    return getRestaurantsApiResponse.items;
  }

  async postRestaurant(
      restaurantId: string,
      cuisineId: string,
      restaurantName: string,
      restaurantCity: string,
      restaurantState: string,
      timestamp: string,
      userId: string
    ) {
      console.log(`In data storage service postRestaurant`);
      const result = await this.apiService.postRestaurant$(
        cuisineId,
        restaurantId,
        restaurantName,
        restaurantCity,
        restaurantState,
        timestamp,
        userId
      );
  }

  async deleteRestaurant(restaurantId: string, cuisineId: string, timestamp: string) {
    console.log(`In data storage service deleteRestaurant`);
    const result = await this.apiService.deleteRestaurant$(restaurantId, cuisineId, timestamp);
  }

  async getReviews(restaurantId: string): Promise<Review[]> {
    console.log(`In data storage service getReviews`);
    const getReviewsApiResponse = await this.apiService.getReviews$(restaurantId);
    return getReviewsApiResponse.items;
  }

  async postReview(
      restaurantId: string,
      timestamp: string,
      reviewId: string,
      nickname: string,
      rating: string,
      description: string,
      userId: string
    ) {
    console.log(`In data storage service postReview`);
    const result = await this.apiService.postReview$(
      restaurantId,
      timestamp,
      reviewId,
      nickname,
      rating,
      description,
      userId
    );
  }

  async getUploadUrl(restaurantId: string, timestamp: string, reviewId: string) {
    return await this.apiService.getUploadUrl$(restaurantId, timestamp, reviewId);
  }

  async uploadImage(selectedFile: File, uploadUrl: string) {
    return await this.apiService.uploadImage$(selectedFile, uploadUrl);
  }
}
