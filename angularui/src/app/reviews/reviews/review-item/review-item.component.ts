import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../shared/services/auth-service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UploadImageService } from '../../upload-image.service';

@Component({
  selector: 'app-review-item',
  templateUrl: './review-item.component.html',
  styleUrls: ['./review-item.component.css']
})
export class ReviewItemComponent implements OnInit {
  @Input() review: any;
  userId: string;
  sub: any;
  attachmentUrl: string;
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private uploadImageService: UploadImageService
  ) { this.sub = this.auth.userProfile$.subscribe(user => {
    this.userId = user.sub;
  }); }

  ngOnInit() {
    if (this.review.attachmentUrl) {
      console.log('There is attachmentUrl');
      this.attachmentUrl = this.review.attachmentUrl;
    } else {
      console.log('There is no attachmentUrl');
      this.attachmentUrl = 'http://design-ec.com/d/e_others_50/l_e_others_500.png';
    }
  }

  async goToUploadImage(reviewId: string, restaurantId: string, timestamp: string) {
    console.log(`Clicked uplaod image for reviewId: ${reviewId}`);
    await this.uploadImageService.setCurrentReviewDetails(reviewId, restaurantId, timestamp);
    this.router.navigate(['upload-image'], { relativeTo: this.route });
  }

  async updateImageUrl(attachmentUrl: string ) {
    if (attachmentUrl.includes('thumbnails')) {
      this.attachmentUrl = attachmentUrl.replace('thumbnails/', '');
    } else {
      this.attachmentUrl = 'http://design-ec.com/d/e_others_50/l_e_others_500.png';
    }
  }

}
