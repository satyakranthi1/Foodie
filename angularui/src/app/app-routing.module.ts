import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared/guards/auth/auth.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './shared/services/interceptor-service/interceptor.service';
import { LandingComponent } from './core/landing/landing.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: '/home', pathMatch: 'full'},
      {
        path: 'home',
        data: {
          breadcrumb: null
        },
        component: LandingComponent
      },
      {
        path: 'cuisines',
        data: {
          breadcrumb: null
        },
        loadChildren: 'src/app/cuisines/cuisines.module#CuisinesModule'
      }
    ]
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
