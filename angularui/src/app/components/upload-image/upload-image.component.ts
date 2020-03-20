import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api-service/api.service';
import { UploadUrlResponse } from 'src/models/UploadUrlResponse';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})
export class UploadImageComponent implements OnInit, OnDestroy {
  sub1;
  reviewId;
  restaurantId;
  timestamp;
  key1 = 'reviewId';
  key2 = 'restaurantId';
  key3 = 'timestamp';
  selectedFile = null;
  response: UploadUrlResponse;
  uploadUrl;
  sub2;
  uploadSuccessful: boolean;
  constructor(private route: ActivatedRoute, private api: ApiService) { }

  ngOnInit() {
    this.sub1 = this.route.params.subscribe(params => {
      this.reviewId = this.route.snapshot.params[this.key1];
      this.restaurantId = this.route.snapshot.params[this.key2];
      this.timestamp = this.route.snapshot.params[this.key3];
    });
    console.log(`The review id is ${this.reviewId} restaurantId is ${this.restaurantId} timestamp is ${this.timestamp}`);
    this.uploadUrl = this.getUploadUrl(this.restaurantId, this.timestamp, this.reviewId);
    this.uploadSuccessful = false;
  }

  getUploadUrl(restaurantId: string, timestamp: string, reviewId: string) {
    this.sub2 = this.api.getUploadUrl$(restaurantId, timestamp, reviewId).subscribe(
      (res: UploadUrlResponse) => {
        console.log(JSON.stringify(res));
        this.uploadUrl = res.uploadUrl;
        console.log(`The upload url is ${this.uploadUrl}`); }
    );
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
  }

  async onUpload() {
    await this.api.uploadImage$(this.selectedFile, this.uploadUrl).toPromise();
    this.uploadSuccessful = true;
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }

}
