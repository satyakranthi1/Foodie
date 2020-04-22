import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/services/api-service/api.service';
import { FormBuilder } from '@angular/forms';
import { ReviewsService } from '../reviews.service';
import { Review } from '../review.model';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit, OnDestroy {
  reviewsList: any;
  subscription: any;
  addReviewForm: any;
  userSubscription: any;
  userId: string;
  constructor(
      private formBuilder: FormBuilder,
      private reviewsService: ReviewsService,
      private authService: AuthService
    ) {
    this.addReviewForm = this.formBuilder.group({
      nickName: '',
      rating: '',
      description: ''
    });
    this.userSubscription = this.authService.userProfile$.subscribe(user => {
      this.userId = user.sub;
    });
  }

  ngOnInit() {
    this.subscription = this.reviewsService.reviewsChanged.subscribe(
      (reviews: Review[]) => {
        this.reviewsList = reviews;
      });
    this.getReviews();
  }

  async getReviews() {
    this.reviewsList = await this.reviewsService.getReviews();
  }

  async onSubmit() {
    console.log( JSON.stringify({
      nickName: this.addReviewForm.value.nickName,
      rating: this.addReviewForm.value.rating,
      description: this.addReviewForm.value.description
    }));

    this.reviewsService.postReview(
      this.addReviewForm.value.nickName,
      this.addReviewForm.value.rating,
      this.addReviewForm.value.description,
      this.userId
    );
    this.addReviewForm.reset();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

}
