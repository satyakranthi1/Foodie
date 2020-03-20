import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../services/auth-service/auth.service';

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
  constructor(private auth: AuthService) { this.sub = this.auth.userProfile$.subscribe(user => {
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

}
