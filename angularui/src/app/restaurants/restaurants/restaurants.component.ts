import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/services/api-service/api.service';
import { FormBuilder } from '@angular/forms';
import { RestaurantsService } from '../restaurants.service';
import { Restaurant } from '../restaurant.model';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css']
})
export class RestaurantsComponent implements OnInit, OnDestroy {
  private subscription: any;
  private userSubscription: any;
  private userId: string;
  restaurantsList: any;
  addRestaurantForm;

  constructor(
      private restaurantsService: RestaurantsService,
      private formBuilder: FormBuilder,
      private authService: AuthService
    ) {
    this.addRestaurantForm = this.formBuilder.group({
      restaurantName: '',
      restaurantCity: '',
      restaurantState: ''
    });

    this.userSubscription = this.authService.userProfile$.subscribe(user => {
      this.userId = user.sub;
    });
   }

  ngOnInit() {
    this.subscription = this.restaurantsService.restaurantsChanged
      .subscribe(
        (restaurants: Restaurant[]) => {
          this.restaurantsList = restaurants;
        }
    );
    this.getRestaurants();
  }

  async getRestaurants() {
    this.restaurantsList = await this.restaurantsService.getRestaurants();
  }

  async onSubmit() {
    console.log(`Restaurant Name: ${this.addRestaurantForm.value.restaurantName}`);
    this.restaurantsService.postRestaurants(
      this.addRestaurantForm.value.restaurantName,
      this.addRestaurantForm.value.restaurantCity,
      this.addRestaurantForm.value.restaurantState,
      this.userId
    );
    this.addRestaurantForm.reset();
  }

  async onDeleteRestaurant(restaurant: any) {
    this.restaurantsService.deleteRestaurant(restaurant.restaurantId, restaurant.cuisineId, restaurant.timestamp);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }
}
