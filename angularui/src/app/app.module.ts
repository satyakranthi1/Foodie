import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { CuisinesComponent } from './components/cuisines/cuisines.component';
import { LandingComponent } from './components/landing/landing.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CuisineItemComponent } from './components/cuisines/cuisine-item/cuisine-item.component';
import { RestaurantsComponent } from './components/restaurants/restaurants.component';
import { RestaurantItemComponent } from './components/restaurants/restaurant-item/restaurant-item.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { ReviewItemComponent } from './components/reviews/review-item/review-item.component';
import { UploadImageComponent } from './components/upload-image/upload-image.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    CuisinesComponent,
    LandingComponent,
    CuisineItemComponent,
    RestaurantsComponent,
    RestaurantItemComponent,
    ReviewsComponent,
    ReviewItemComponent,
    UploadImageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
