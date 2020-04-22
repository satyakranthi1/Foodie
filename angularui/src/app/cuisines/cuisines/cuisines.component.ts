import { Component, OnInit, OnDestroy } from '@angular/core';
import { CuisinesService } from '../cuisines.service';
import { FormBuilder } from '@angular/forms';
import { Cuisine } from '../cuisine.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cuisines',
  templateUrl: './cuisines.component.html',
  styleUrls: ['./cuisines.component.css']
})
export class CuisinesComponent implements OnInit, OnDestroy {
  cuisinesList: { id: string, cuisineName: string }[];
  addCuisineForm;
  subscription: Subscription;
  constructor(private cuisinesService: CuisinesService, private formBuilder: FormBuilder) {
    this.addCuisineForm = this.formBuilder.group({
      cuisineName: ''
    });
  }

  ngOnInit() {
    this.subscription = this.cuisinesService.cuisinesChanged
      .subscribe(
        (cuisines: Cuisine[]) => {
          this.cuisinesList = cuisines;
        }
      );
    this.getCuisines();
  }

  async getCuisines() {
    this.cuisinesList = await this.cuisinesService.getCuisines();
  }

  async onSubmit() {
    console.log(`Cuisine Name: ${this.addCuisineForm.value.cuisineName}`);
    this.cuisinesService.postCuisine(this.addCuisineForm.value.cuisineName);
    this.addCuisineForm.reset();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
