import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth-service/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BreadCrumb } from '../models/breadcrumb.model';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  subscription: Subscription;
  breadcrumbs: BreadCrumb[];

  constructor(
    public auth: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.subscription = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      console.log(`Breadcrumbs are: ${JSON.stringify(this.breadcrumbs)}`);
    });
  }

  login() {
    this.auth.login();
    this.router.navigate(['/cuisines']);
  }

  logout() {
    this.auth.logout();
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: BreadCrumb[] = []
  ): BreadCrumb[] {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data.breadcrumb;
      if (!isNullOrUndefined(label)) {
        breadcrumbs.push(
          {
            Label: label,
            Url: url
          });
      }
      console.log(`breadcrumbs loop: ${JSON.stringify(breadcrumbs)}`);
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
  }
}
