import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from '../shared/services/interceptor-service/interceptor.service';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { RestaurantsService } from './restaurants.service';

const routes: Routes = [
    {
      path: '',
      data: {
        breadcrumb: 'Restaurants'
      },
      children: [
        {
          path: '',
          data: {
            breadcrumb: null
          },
          component: RestaurantsComponent,
        },
        {
          path: 'reviews',
          data: {
            breadcrumb: null
          },
          loadChildren: 'src/app/reviews/reviews.module#ReviewsModule'
        }
      ]
    }
  ];

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule],
providers: [
    {
    provide: HTTP_INTERCEPTORS,
    useClass: InterceptorService,
    multi: true
    }
]
})
export class RestaurantsRoutingModule { }
