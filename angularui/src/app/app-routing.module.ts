import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './services/interceptor-service/interceptor.service';
import { CuisinesComponent } from './components/cuisines/cuisines.component';
import { LandingComponent } from './components/landing/landing.component';
import { RestaurantsComponent } from './components/restaurants/restaurants.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { UploadImageComponent } from './components/upload-image/upload-image.component';


const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'cuisines',
    component: CuisinesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurants/:id',
    component: RestaurantsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reviews/:restaurantId',
    component: ReviewsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reviews/review/:reviewId',
    component: UploadImageComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ]
})
export class AppRoutingModule { }
