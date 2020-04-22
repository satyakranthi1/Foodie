import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from '../shared/services/interceptor-service/interceptor.service';
import { CuisinesComponent } from './cuisines/cuisines.component';


const routes: Routes = [
    {
      path: '',
      data: {
        breadcrumb: 'Cusines'
      },
      children: [
        {
          path: '',
          data: {
            breadcrumb: null
          },
          component: CuisinesComponent,
        },
        {
          path: 'restaurants',
          data: {
            breadcrumb: null
          },
          loadChildren: 'src/app/restaurants/restaurants.module#RestaurantsModule'
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
export class CuisinesRoutingModule { }
