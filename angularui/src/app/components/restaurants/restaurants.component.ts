import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api-service/api.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css']
})
export class RestaurantsComponent implements OnInit, OnDestroy {
  id: string;
  private sub1: any;
  private sub2: any;
  key = 'id';
  restaurantsList: any;
  addRestaurantForm;

  constructor(private route: ActivatedRoute, private api: ApiService, private formBuilder: FormBuilder) {
    this.addRestaurantForm = this.formBuilder.group({
      restaurantName: '',
      restaurantCity: '',
      restaurantState: ''
    });
   }

  ngOnInit() {
    this.sub1 = this.route.params.subscribe(params => {
      this.id = this.route.snapshot.params[this.key];
    });
    this.getRestaurants();
    console.log(this.id);
  }

  getRestaurants() {
    this.sub2 = this.api.getRestaurants$(this.id).subscribe(
      restaurants => this.restaurantsList = restaurants.items
    );
    console.log(this.restaurantsList);
  }

  async onSubmit() {
    console.log(`Restaurant Name: ${this.addRestaurantForm.value.restaurantName}`);
    await this.api.postRestaurant$(
      this.id,
      this.addRestaurantForm.value.restaurantName, this.addRestaurantForm.value.restaurantCity, this.addRestaurantForm.value.restaurantState).toPromise();
    this.addRestaurantForm.reset();
    this.getRestaurants();
  }

  async onDeleteRestaurant(restaurant: any) {
    await this.api.deleteRestaurant$(restaurant.restaurantId, restaurant.cuisineId, restaurant.timestamp).toPromise();
    this.getRestaurants();
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}
