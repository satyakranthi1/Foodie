import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AuthService } from '../../../shared/services/auth-service/auth.service';
import { ReviewsService } from 'src/app/reviews/reviews.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-restaurant-item',
  templateUrl: './restaurant-item.component.html',
  styleUrls: ['./restaurant-item.component.css']
})
export class RestaurantItemComponent implements OnInit, OnDestroy {
  @Input() restaurant: any;
  @Output() deleteEvent = new EventEmitter();
  sub: Subscription;
  userId: string;
  constructor(
      private auth: AuthService,
      private reviewsService: ReviewsService,
      private router: Router,
      private route: ActivatedRoute
    ) {
    this.sub = this.auth.userProfile$.subscribe(user => {
      this.userId = user.sub;
    });
  }

  ngOnInit() {
  }

  async goToReviews(restaurantId: string) {
    console.log(`Clicked restaurant: ${restaurantId}`);
    await this.reviewsService.setCurrentRestaurant(restaurantId);
    this.router.navigate(['reviews'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
