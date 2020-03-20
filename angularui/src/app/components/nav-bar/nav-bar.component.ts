import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  constructor(public auth: AuthService, public router: Router) { }

  ngOnInit() {
    if (this.auth.loggedIn) {
      this.router.navigate(['/cuisines']);
    }
  }

  login() {
    this.auth.login();
    this.router.navigate(['/cuisines']);
  }

  logout() {
    this.auth.logout();
  }

}
