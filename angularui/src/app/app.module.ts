import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './core/nav-bar/nav-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { LandingComponent } from './core/landing/landing.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestaurantsComponent } from './restaurants/restaurants/restaurants.component';
import { RestaurantItemComponent } from './restaurants/restaurants/restaurant-item/restaurant-item.component';
import { ReviewsComponent } from './reviews/reviews/reviews.component';
import { ReviewItemComponent } from './reviews/reviews/review-item/review-item.component';
import { UploadImageComponent } from './reviews/upload-image/upload-image.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    LandingComponent
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
