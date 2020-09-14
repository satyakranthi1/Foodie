import * as uuid from 'uuid';
import { remove } from 'lodash';

import { Injectable } from '@angular/core';
import { Cuisine } from '../cuisines/cuisine.model';
import { Subject } from 'rxjs';
import { Restaurant } from './restaurant.model';
import { DataStorageService } from '../shared/services/data-storage-service/data-storage.service';
import { AuthService } from '../shared/services/auth-service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RestaurantsService {
  restaurantsChanged = new Subject<Restaurant[]>();
  private currentCuisine: Cuisine = { id: '', cuisineName: '' };
  private restaurants: Restaurant[] = [];
  constructor(
      private dataStorageService: DataStorageService,
      private authService: AuthService
    ) { }

  async getRestaurants() {
    console.log(`In get restaurants`);
    console.log(`Calling restaurants api id is ${this.currentCuisine.id}`);
    this.restaurants = await this.dataStorageService.getRestaurants(this.currentCuisine.id);
    return this.restaurants.slice();
  }

  async postRestaurants(
      restaurantName: string,
      restaurantCity: string,
      restaurantState: string,
      userId: string
    ) {
    const restaurantId = uuid.v4();
    const timestamp = new Date().toISOString();
    const result = await this.dataStorageService.postRestaurant(
        restaurantId,
        this.currentCuisine.id,
        restaurantName,
        restaurantCity,
        restaurantState,
        timestamp,
        userId
      );
    this.restaurants.push(
      {
        restaurantId,
        cuisineId : this.currentCuisine.id,
        restaurantName,
        restaurantCity,
        restaurantState,
        timestamp,
        userId
      }
    );
    this.restaurantsChanged.next(this.restaurants.slice());
  }

  async deleteRestaurant(restaurantId: string, cuisineId: string) {
    const result = await this.dataStorageService.deleteRestaurant(restaurantId, cuisineId);
    remove(this.restaurants, (el: Restaurant) => el.restaurantId === restaurantId);
    this.restaurantsChanged.next(this.restaurants.slice());
  }

  async setCurrentCuisine(id: string, cuisineName: string) {
    console.log(`In set current cuisine id: ${id} name: ${cuisineName}`);
    this.currentCuisine.id = id;
    this.currentCuisine.cuisineName = cuisineName;
    console.log(`Current cuisine is set to id: ${this.currentCuisine.id} name: ${this.currentCuisine.cuisineName}`);
    return;
  }
}
