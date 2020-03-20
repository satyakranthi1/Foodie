import { Component, OnInit, Input, Output, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api-service/api.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit, OnDestroy {
  restaurantId: string;
  key = 'restaurantId';
  reviewsList: any;
  sub1: any;
  sub2: any;
  addReviewForm: any;
  constructor(private api: ApiService, private route: ActivatedRoute, private formBuilder: FormBuilder) {
    this.addReviewForm = this.formBuilder.group({
      nickName: '',
      rating: '',
      description: ''
    });
  }

  ngOnInit() {
    this.sub1 = this.route.params.subscribe(params => {
      this.restaurantId = this.route.snapshot.params[this.key];
    });
    this.getReviews(this.restaurantId);
  }

  getReviews(restaurantId: string) {
    this.sub2 = this.api.getReviews$(this.restaurantId).subscribe(
      reviews => this.reviewsList = reviews.items
    );
    console.log(this.reviewsList);
  }

  async onSubmit() {
    console.log( JSON.stringify({
      nickName: this.addReviewForm.value.nickName,
      rating: this.addReviewForm.value.rating,
      description: this.addReviewForm.value.description
    }));
    await this.api.postReview$(
      this.restaurantId,
      this.addReviewForm.value.nickName,
      this.addReviewForm.value.rating,
      this.addReviewForm.value.description
    ).toPromise();
    this.addReviewForm.reset();
    this.getReviews(this.restaurantId);
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub1.unsubscribe();
  }

}
