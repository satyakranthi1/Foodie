import { Injectable, COMPILER_OPTIONS } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from '../auth-service/auth.service';
import { Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  s3domain = 'foodtastic-images-spenu-dev.s3.us-east-2.amazonaws.com';
  constructor(private auth: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.auth.getTokenSilently$().pipe(
      mergeMap(token => {
        if (req.url.search(this.s3domain) === -1) {
          console.log(`Adding bearer token to the request`);
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
        }
        return next.handle(req);
      }),
      catchError(err => throwError(err))
    );
  }
}
