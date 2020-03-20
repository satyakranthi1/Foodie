import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth-service/auth.service';

@Component({
  selector: 'app-restaurant-item',
  templateUrl: './restaurant-item.component.html',
  styleUrls: ['./restaurant-item.component.css']
})
export class RestaurantItemComponent implements OnInit, OnDestroy {
  @Input() restaurant: any;
  @Output() deleteEvent = new EventEmitter();
  sub;
  userId;
  constructor(private auth: AuthService) {
    this.sub = this.auth.userProfile$.subscribe(user => {
      this.userId = user.sub;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
