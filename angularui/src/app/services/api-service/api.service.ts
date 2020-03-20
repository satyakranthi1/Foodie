import { configuration } from '../../config';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadUrlResponse } from 'src/models/UploadUrlResponse';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getCuisines$(): Observable<any> {
    console.log(`In apiservice getCuisines`);
    return this.http.get(`${configuration.apiEndpoint}/cuisines`);
  }

  postCuisine$(cuisineName: string): Observable<any> {
    console.log(`In postCuisine`);
    return this.http.post(`${configuration.apiEndpoint}/cuisines`, {
      cuisineName
    });
  }

  getRestaurants$(id: string): Observable<any>  {
    console.log(`In getRestaurants`);
    return this.http.get(`${configuration.apiEndpoint}/cuisines/${id}/restaurants`);
  }

  getReviews$(restaurantId: string): Observable<any> {
    console.log(`In getReviews`);
    console.log(`Restaurant Id is ${restaurantId}`);
    return this.http.get(`${configuration.apiEndpoint}/restaurants/${restaurantId}/reviews`);
  }

  getUploadUrl$(restaurantId: string, timestamp: string, reviewId: string): Observable<UploadUrlResponse> {
    console.log(`In getUploadUrl`);
    return this.http.post<UploadUrlResponse>(`${configuration.apiEndpoint}/reviews/attachment`, {
      restaurantId,
      timestamp,
      reviewId
    });
  }


  postRestaurant$(cuisineId: string, restaurantName: string, restaurantCity: string, restaurantState: string) {
    console.log(`In postRestaurant`);
    console.log(JSON.stringify({
      cuisineId,
      restaurantName,
      restaurantCity,
      restaurantState
    }));
    return this.http.post(`${configuration.apiEndpoint}/restaurants`, {
      cuisineId,
      restaurantName,
      restaurantCity,
      restaurantState
    });
  }

  postReview$(restaurantId: string, nickName: string, rating: string, description: string) {
    console.log(`In postReview`);
    return this.http.post(`${configuration.apiEndpoint}/reviews`, {
      restaurantId,
      nickName,
      rating,
      description
    });
  }

  uploadImage$(selectedFile: File, uploadUrl: string) {
    console.log(`The UPLOAD URL is ${uploadUrl}`);
    console.log(`In upload Image ${uploadUrl}`);
    return this.http.put(uploadUrl, selectedFile);
  }

  deleteRestaurant$(restaurantId: string, cuisineId: string, timestamp: string) {
    console.log(`In deleteRestaurant`);
    console.log(JSON.stringify({
      cuisineId,
      timestamp
    }));
    return this.http.post(`${configuration.apiEndpoint}/restaurants/${restaurantId}`, {
      cuisineId,
      timestamp
    });
  }
}
