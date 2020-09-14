import { configuration } from '../../../config';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GetCuisinesResponse } from './models/getCuisinesResponse';
import { PostCuisineResponse } from './models/postCuisineResponse';
import { GetRestaurantResponse } from './models/getRestaurantResponse';
import { GetReviewsResponse } from './models/getReviewsResponse';
import { UploadUrlResponse } from './models/UploadUrlResponse';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getCuisines$(): Promise<GetCuisinesResponse> {
    console.log(`In apiservice getCuisines`);
    return this.http.get<GetCuisinesResponse>(`${configuration.apiEndpoint}/cuisines`).toPromise();
  }

  postCuisine$(id: string, cuisineName: string): Promise<PostCuisineResponse> {
    console.log(`In postCuisine`);
    return this.http.post<PostCuisineResponse>(`${configuration.apiEndpoint}/cuisines`, {
      id,
      cuisineName
    }).toPromise();
  }

  getRestaurants$(id: string): Promise<GetRestaurantResponse> {
    console.log(`In getRestaurants`);
    return this.http.get<GetRestaurantResponse>(`${configuration.apiEndpoint}/cuisines/${id}/restaurants`).toPromise();
  }

  getReviews$(restaurantId: string): Promise<GetReviewsResponse> {
    console.log(`In getReviews`);
    console.log(`Restaurant Id is ${restaurantId}`);
    return this.http.get<GetReviewsResponse>(`${configuration.apiEndpoint}/restaurants/${restaurantId}/reviews`).toPromise();
  }

  getUploadUrl$(restaurantId: string, reviewId: string): Promise<UploadUrlResponse> {
    console.log(`In getUploadUrl`);
    return this.http.post<UploadUrlResponse>(`${configuration.apiEndpoint}/reviews/attachment`, {
      restaurantId,
      reviewId
    }).toPromise();
  }

  async postRestaurant$(
      cuisineId: string,
      restaurantId: string,
      restaurantName: string,
      restaurantCity: string,
      restaurantState: string,
      timestamp: string,
      userId: string
    ) {
    console.log(`In postRestaurant`);
    console.log(JSON.stringify({
      cuisineId,
      restaurantId,
      restaurantName,
      restaurantCity,
      restaurantState,
      timestamp,
      userId
    }));
    return this.http.post(`${configuration.apiEndpoint}/restaurants`, {
      cuisineId,
      restaurantId,
      restaurantName,
      restaurantCity,
      restaurantState,
      timestamp,
      userId
    }).toPromise();
  }

  async postReview$(
      restaurantId: string,
      timestamp: string,
      reviewId: string,
      nickName: string,
      rating: string,
      description: string,
      userId: string
    ) {
    console.log(`In postReview`);
    return this.http.post(`${configuration.apiEndpoint}/reviews`, {
      restaurantId,
      timestamp,
      reviewId,
      nickName,
      rating,
      description,
      userId
    }).toPromise();
  }

  uploadImage$(selectedFile: File, uploadUrl: string) {
    console.log(`The UPLOAD URL is ${uploadUrl}`);
    console.log(`In upload Image ${uploadUrl}`);
    return this.http.put(uploadUrl, selectedFile).toPromise();
  }

  deleteRestaurant$(restaurantId: string, cuisineId: string) {
    console.log(`In deleteRestaurant`);
    console.log(JSON.stringify({
      cuisineId,
      restaurantId
    }));
    return this.http.post(`${configuration.apiEndpoint}/restaurants/${restaurantId}`, {
      cuisineId,
      restaurantId
    }).toPromise();
  }
}
