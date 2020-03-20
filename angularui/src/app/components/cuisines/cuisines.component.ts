import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api-service/api.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-cuisines',
  templateUrl: './cuisines.component.html',
  styleUrls: ['./cuisines.component.css']
})
export class CuisinesComponent implements OnInit, OnDestroy {
  cuisinesList: { id: string, cuisineName: string }[];
  addCuisineForm;
  subscription;
  constructor(private api: ApiService, private formBuilder: FormBuilder) {
    this.addCuisineForm = this.formBuilder.group({
      cuisineName: ''
    });
  }

  ngOnInit() {
    this.getCuisines();
  }

  getCuisines() {
    this.subscription = this.api.getCuisines$().subscribe(
      cuisines => this.cuisinesList = cuisines.items
    );
  }

  async onSubmit() {
    console.log(`Cuisine Name: ${this.addCuisineForm.value.cuisineName}`);
    await this.api.postCuisine$(this.addCuisineForm.value.cuisineName).toPromise();
    this.addCuisineForm.reset();
    this.getCuisines();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
