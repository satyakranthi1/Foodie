import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from '../shared/services/interceptor-service/interceptor.service';
import { ReviewsComponent } from './reviews/reviews.component';
import { UploadImageComponent } from './upload-image/upload-image.component';

const routes: Routes = [
    {
      path: '',
      data: {
        breadcrumb: 'Reviews'
      },
      children: [
          {
              path: '',
              data: {
                breadcrumb: null
              },
              component: ReviewsComponent
          },
          {
            path: 'upload-image',
            data: {
              breadcrumb: 'Upload Image'
            },
            component: UploadImageComponent
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
export class ReviewsRoutingModule { }
