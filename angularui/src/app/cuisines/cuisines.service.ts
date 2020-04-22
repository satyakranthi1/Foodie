import * as uuid from 'uuid';

import { Injectable } from '@angular/core';
import { DataStorageService } from '../shared/services/data-storage-service/data-storage.service';
import { Subscription, Subject } from 'rxjs';
import { Cuisine } from './cuisine.model';

@Injectable({
  providedIn: 'root'
})
export class CuisinesService {
  cuisinesChanged = new Subject<Cuisine[]>();
  subscription: Subscription;
  private cuisines: Cuisine[] = [];
  constructor(private dataService: DataStorageService) { }

  async getCuisines() {
    if (this.cuisines.length !== 0) {
      return this.cuisines.slice();
    } else {
      this.cuisines = await this.dataService.getCuisines();
      return this.cuisines.slice();
    }
  }

  postCuisine(cuisineName: string) {
    const id = uuid.v4();
    this.dataService.postCuisine(id, cuisineName);
    this.cuisines.push({ id, cuisineName});
    console.log(`Pushed to cuisines`);
    this.cuisinesChanged.next(this.cuisines.slice());
  }
}
